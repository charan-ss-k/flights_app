from flask import Blueprint, jsonify, request
import pandas as pd
from datetime import datetime
from app_utils import get_db_engine
import pytz

all_flights_bp = Blueprint('all_flights', __name__)

@all_flights_bp.route('/api/all_flights', methods=['GET'])
def get_all_flights():
    date_str = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    ist = pytz.timezone('Asia/Kolkata')
    utc = pytz.timezone('UTC')
    
    start_date_ist = ist.localize(date_obj.replace(hour=0, minute=0, second=0, microsecond=0))
    end_date_ist = ist.localize(date_obj.replace(hour=23, minute=59, second=59, microsecond=999999))
    
    start_date_utc = start_date_ist.astimezone(utc)
    end_date_utc = end_date_ist.astimezone(utc)
    
    print(f"Querying flights for IST date: {date_str}")
    print(f"IST Range: {start_date_ist} to {end_date_ist}")
    print(f"UTC Range: {start_date_utc} to {end_date_utc}")
    
    engine = get_db_engine()

    try:
        df_arrivals = pd.read_sql(
            """
            SELECT 
                flight, operational_status, stoa, flight_type, flight_mode, 
                number_of_passenger, etoa, arrival_belt_no, psta, airline, origin 
            FROM arrivals 
            WHERE etoa >= %s AND etoa <= %s
            """,
            engine,
            params=(start_date_utc, end_date_utc)
        )
        df_arrivals['dep_boarding_gate_no'] = None
        df_arrivals['pstd'] = None
        df_arrivals['destination'] = None

        df_departures = pd.read_sql(
            """
            SELECT 
                flight, operational_status, stod, flight_type, flight_mode, 
                number_of_passenger, etod, dep_boarding_gate_no, pstd, airline, destination
            FROM departures 
            WHERE etod >= %s AND etod <= %s
            """,
            engine,
            params=(start_date_utc, end_date_utc)
        )
        df_departures['arrival_belt_no'] = None
        df_departures['psta'] = None
        df_departures['origin'] = None

        df = pd.concat([df_arrivals, df_departures], ignore_index=True)
        
        df['flight_datetime'] = df.apply(
            lambda row: row['etoa'] if row['flight_type'] == 'ARR' else row['etod'],
            axis=1
        )
        df = df.dropna(subset=['flight_datetime'])

        datetime_columns = ['stoa', 'etoa', 'stod', 'etod']
        for col in datetime_columns:
            if col in df.columns and not df[col].isna().all():
                df[col] = pd.to_datetime(df[col], utc=True).dt.tz_convert(ist)
                df[col] = df[col].apply(lambda x: x.strftime('%Y-%m-%dT%H:%M:%S') if pd.notnull(x) else "")
        
        for stand_col in ['psta', 'pstd']:
            if stand_col in df.columns:
                df[stand_col] = df[stand_col].apply(lambda x: 
                    int(x) if pd.notnull(x) and str(x).strip() not in ['', '-', 'None'] and str(x).isdigit()
                    else None
                )
        
        df = df.replace({float('nan'): None})

        flights = df.to_dict('records')
        
        print(f"Found {len(flights)} flights for IST date {date_str}")
        
        psta_values = [f.get('psta') for f in flights if f.get('psta') is not None]
        pstd_values = [f.get('pstd') for f in flights if f.get('pstd') is not None]
        print(f"PSTA values found: {len(psta_values)} - Sample: {psta_values[:5]}")
        print(f"PSTD values found: {len(pstd_values)} - Sample: {pstd_values[:5]}")
        
        return jsonify({'flights': flights})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({'error': str(e)}), 500