from flask import Blueprint, jsonify, request
import pandas as pd
from datetime import datetime
import pytz
from app_utils import get_db_engine

arrivals_bp = Blueprint('arrivals', __name__)

@arrivals_bp.route('/api/arrivals', methods=['GET'])
def get_arrivals():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    try:
        ist = pytz.timezone('Asia/Kolkata')
        today_str = datetime.now(ist).strftime('%Y-%m-%d')
        if date < today_str:
            return jsonify({'flights': [], 'total': 0, 'message': 'Past dates are not available'})
        engine = get_db_engine()
        query = "SELECT * FROM arrivals"
        df = pd.read_sql(query, engine)
        df['stoa'] = pd.to_datetime(df['stoa'], utc=True).dt.tz_convert(ist)
        df['etoa'] = pd.to_datetime(df['etoa'], utc=True).dt.tz_convert(ist)
        df['etoa_date'] = df['etoa'].dt.strftime('%Y-%m-%d')
        filtered_df = df[
            (df['etoa_date'] == date) &
            (df['operational_status'].str.lower() != 'not operating')
        ].copy()
        real_now = datetime.now(ist)
        virtual_now = ist.localize(datetime.strptime(date, "%Y-%m-%d")).replace(
            hour=real_now.hour, minute=real_now.minute, second=real_now.second, microsecond=real_now.microsecond
        )
        past_flights = (filtered_df[filtered_df['etoa'] < virtual_now]
                        .sort_values(by='etoa', ascending=False)
                        .head(30)
                        .sort_values(by='etoa', ascending=True))
        upcoming_flights = (filtered_df[filtered_df['etoa'] >= virtual_now]
                            .sort_values(by='etoa', ascending=True)
                            .head(60))
        result_df = pd.concat([past_flights, upcoming_flights]).reset_index(drop=True)
        for col in ['stoa', 'etoa']:
            result_df[col] = result_df[col].dt.strftime('%Y-%m-%dT%H:%M:%S%z')
        flights = result_df.to_dict('records')
        total_flights = len(filtered_df)
        return jsonify({'flights': flights, 'total': total_flights})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({'error': str(e)}), 500