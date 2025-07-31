import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import pymysql
import time
import pytz

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "12345678",
    "database": "flight_db",
    "cursorclass": pymysql.cursors.DictCursor
}

airlines = ["6E", "UK", "AI", "SG", "IX", "I5", "G8", "QP", "2T", "S5", "TG", "EK", "QR", "BA", "LH", "SQ", "CX", "MH", "AK", "FD"]

domestic_cities = [
    {"name": "DELHI", "weight": 15, "passenger_modifier": 1.0},
    {"name": "MUMBAI", "weight": 14, "passenger_modifier": 0.97},
    {"name": "BENGALURU", "weight": 13, "passenger_modifier": 0.95},
    {"name": "CHENNAI", "weight": 12, "passenger_modifier": 0.93},
    {"name": "PUNE", "weight": 9, "passenger_modifier": 0.85},
    {"name": "AHMEDABAD", "weight": 8, "passenger_modifier": 0.8},
    {"name": "KOCHI", "weight": 7, "passenger_modifier": 0.70},
    {"name": "GOA", "weight": 7, "passenger_modifier": 0.85},
    {"name": "JAIPUR", "weight": 6, "passenger_modifier": 0.65},
    {"name": "LUCKNOW", "weight": 6, "passenger_modifier": 0.65},
    {"name": "TIRUPATI", "weight": 6, "passenger_modifier": 0.6},
    {"name": "COIMBATORE", "weight": 5, "passenger_modifier": 0.6},
    {"name": "BHUBANESHWAR", "weight": 5, "passenger_modifier": 0.6},
    {"name": "CHANDIGARH", "weight": 5, "passenger_modifier": 0.65},
    {"name": "INDORE", "weight": 4, "passenger_modifier": 0.4},
    {"name": "GUWAHATI", "weight": 4, "passenger_modifier": 0.3},
    {"name": "VISHAKHAPATNAM", "weight": 3, "passenger_modifier": 0.5},
    {"name": "THIRUVANANTHAPURAM", "weight": 3, "passenger_modifier": 0.4},
    {"name": "VARANASI", "weight": 3, "passenger_modifier": 0.3},
    {"name": "PATNA", "weight": 2, "passenger_modifier": 0.2},
    {"name": "RANCHI", "weight": 2, "passenger_modifier": 0.4},
    {"name": "BHOPAL", "weight": 2, "passenger_modifier": 0.35},
    {"name": "MANGALORE", "weight": 1, "passenger_modifier": 0.45},
    {"name": "MADURAI", "weight": 1, "passenger_modifier": 0.35},
    {"name": "RAJAHMUNDRY", "weight": 1, "passenger_modifier": 0.3},
    {"name": "SHIRDI", "weight": 1, "passenger_modifier": 0.4},
    {"name": "AURANGABAD", "weight": 1, "passenger_modifier": 0.25}
]

international_cities = [
    {"name": "DUBAI", "weight": 15, "passenger_modifier": 1.0},
    {"name": "SINGAPORE", "weight": 13, "passenger_modifier": 0.92},
    {"name": "LONDON", "weight": 12, "passenger_modifier": 0.95},
    {"name": "DOHA", "weight": 11, "passenger_modifier": 0.97},
    {"name": "ABU DHABI", "weight": 10, "passenger_modifier": 1.0},
    {"name": "BANGKOK", "weight": 9, "passenger_modifier": 0.75},
    {"name": "KUALA LUMPUR", "weight": 8, "passenger_modifier": 0.8},
    {"name": "HONG KONG", "weight": 7, "passenger_modifier": 0.7},
    {"name": "UAE", "weight": 1, "passenger_modifier": 0.85},
    {"name": "MUSCAT", "weight": 6, "passenger_modifier": 0.85},
    {"name": "SHARJAH", "weight": 6, "passenger_modifier": 0.85},
    {"name": "COLOMBO", "weight": 5, "passenger_modifier": 0.7},
    {"name": "RIYADH", "weight": 5, "passenger_modifier": 0.75},
    {"name": "JEDDAH", "weight": 4, "passenger_modifier": 0.65},
    {"name": "KUWAIT", "weight": 4, "passenger_modifier": 0.45},
    {"name": "BAHRAIN", "weight": 3, "passenger_modifier": 0.35},
    {"name": "DHAKA", "weight": 3, "passenger_modifier": 0.4},
    {"name": "DAMMAM", "weight": 2, "passenger_modifier": 0.3},
    {"name": "MALDIVES", "weight": 2, "passenger_modifier": 0.65},
    {"name": "FRANKFURT", "weight": 7, "passenger_modifier": 0.5}
]

def get_random_timestamp(start_date, end_date):
    delta = end_date - start_date
    random_seconds = random.randint(0, int(delta.total_seconds()))
    timestamp = start_date + timedelta(seconds=random_seconds)
    ist_timezone = pytz.timezone('Asia/Kolkata')
    timestamp_ist = pytz.utc.localize(timestamp).astimezone(ist_timezone)
    return timestamp_ist.replace(tzinfo=None)

def get_unique_timestamp(used_timestamps, base_time, max_minutes_variance=60):
    while True:
        variance_seconds = random.randint(0, max_minutes_variance * 60)
        new_time = base_time + timedelta(seconds=variance_seconds)
        new_time_str = new_time.strftime('%Y-%m-%d %H:%M:%S')
        if new_time_str not in used_timestamps:
            used_timestamps.add(new_time_str)
            return new_time_str

def generate_flight_data(start_date, total_flights=50000):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()
    
    used_stoa = set()
    used_stod = set()
    used_etoa = set()
    used_etod = set()
    
    current_date = start_date
    count = 0
    
    while count < total_flights:
        daily_flights = random.randint(550, 620)
        arrivals_count = daily_flights // 2
        departures_count = daily_flights - arrivals_count

        arrivals_list = []
        for _ in range(arrivals_count):
            if count >= total_flights:
                break
            base_time = get_random_timestamp(current_date, current_date + timedelta(days=1))
            hour = base_time.hour
            
            if 6 <= hour < 18:
                flight_mode = "DOM" if random.random() < 0.8 else "INT"
            else:
                flight_mode = "INT" if random.random() < 0.8 else "DOM"
            
            airline = random.choice(airlines)
            flight_number = f"{airline}{random.randint(1000, 9999)}"
            
            status_rand = random.random()
            if status_rand < 0.9:
                operational_status = "Operating"
            elif status_rand < 0.97:
                operational_status = "Not operating"
            else:
                operational_status = "Cancelled"
                
            if flight_mode == "INT":
                origin_data = random.choices(international_cities,
                                              weights=[city["weight"] for city in international_cities],
                                              k=1)[0]
                origin = origin_data["name"]
                passengers = int(random.randint(150, 250) * origin_data["passenger_modifier"])
            else:
                origin_data = random.choices(domestic_cities,
                                              weights=[city["weight"] for city in domestic_cities],
                                              k=1)[0]
                origin = origin_data["name"]
                passengers = int(random.randint(40, 220) * origin_data["passenger_modifier"])
            
            stoa = get_unique_timestamp(used_stoa, base_time)
            etoa = get_unique_timestamp(used_etoa, base_time - timedelta(minutes=random.randint(5, 20)))
            
            belt_no = random.randint(11, 24)
            psta_num = random.randint(1, 80) if random.random() < 0.7 else random.randint(201, 220)
            
            arrivals_list.append({
                "base_time": base_time,
                "flight": flight_number,
                "operational_status": operational_status,
                "stoa": stoa,
                "flight_type": "ARR",
                "flight_mode": flight_mode,
                "number_of_passenger": passengers,
                "etoa": etoa,
                "arrival_belt_no": belt_no,
                "psta": psta_num,
                "airline": airline,
                "origin": origin
            })
        
        arrivals_list = sorted(arrivals_list, key=lambda x: x["base_time"])
        for record in arrivals_list:
            cursor.execute("""
                INSERT INTO arrivals (flight, operational_status, stoa, flight_type, flight_mode, 
                                        number_of_passenger, etoa, arrival_belt_no, psta, airline, origin)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                record["flight"], record["operational_status"], record["stoa"], record["flight_type"],
                record["flight_mode"], record["number_of_passenger"], record["etoa"],
                record["arrival_belt_no"], record["psta"], record["airline"], record["origin"]
            ))
            count += 1
            if count % 1000 == 0:
                print(f"Generated {count} flights so far...")
                conn.commit()
        
        departures_list = []
        for _ in range(departures_count):
            if count >= total_flights:
                break
            base_time = get_random_timestamp(current_date, current_date + timedelta(days=1))
            hour = base_time.hour
            
            if 6 <= hour < 18:
                flight_mode = "DOM" if random.random() < 0.8 else "INT"
            else:
                flight_mode = "INT" if random.random() < 0.8 else "DOM"
                    
            airline = random.choice(airlines)
            flight_number = f"{airline}{random.randint(1000, 9999)}"
            
            status_rand = random.random()
            if status_rand < 0.9:
                operational_status = "Operating"
            elif status_rand < 0.97:
                operational_status = "Not operating"
            else:
                operational_status = "Cancelled"
            
            if flight_mode == "INT":
                destination_data = random.choices(international_cities,
                                                  weights=[city["weight"] for city in international_cities],
                                                  k=1)[0]
                destination = destination_data["name"]
                passengers = int(random.randint(150, 250) * destination_data["passenger_modifier"])
            else:
                destination_data = random.choices(domestic_cities,
                                                  weights=[city["weight"] for city in domestic_cities],
                                                  k=1)[0]
                destination = destination_data["name"]
                passengers = int(random.randint(40, 220) * destination_data["passenger_modifier"])
            
            stod = get_unique_timestamp(used_stod, base_time)
            etod = get_unique_timestamp(used_etod, base_time - timedelta(minutes=random.randint(5, 20)))
            
            if random.random() < 0.5:
                gate_no = str(random.randint(1, 20))
            else:
                gate_num = random.randint(20, 30)
                gate_letter = random.choice(["A", "B"])
                gate_no = f"{gate_num}{gate_letter}"
                
            pstd_num = random.randint(1, 80) if random.random() < 0.7 else random.randint(201, 220)
            
            departures_list.append({
                "base_time": base_time,
                "flight": flight_number,
                "operational_status": operational_status,
                "stod": stod,
                "flight_type": "DER",
                "flight_mode": flight_mode,
                "number_of_passenger": passengers,
                "etod": etod,
                "dep_boarding_gate_no": gate_no,
                "pstd": pstd_num,
                "airline": airline,
                "destination": destination
            })
        
        departures_list = sorted(departures_list, key=lambda x: x["base_time"])
        for record in departures_list:
            cursor.execute("""
                INSERT INTO departures (flight, operational_status, stod, flight_type, flight_mode, 
                                          number_of_passenger, etod, dep_boarding_gate_no, pstd, airline, destination)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                record["flight"], record["operational_status"], record["stod"], record["flight_type"],
                record["flight_mode"], record["number_of_passenger"], record["etod"],
                record["dep_boarding_gate_no"], record["pstd"], record["airline"], record["destination"]
            ))
            count += 1
            if count % 1000 == 0:
                print(f"Generated {count} flights so far...")
                conn.commit()
        
        current_date += timedelta(days=1)
        conn.commit()
    
    conn.commit()
    print(f"Successfully generated {count} flights.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    start_date = datetime(2025, 5, 20)
    generate_flight_data(start_date)