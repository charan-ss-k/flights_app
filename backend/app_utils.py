import mysql.connector
from sqlalchemy import create_engine

USER_CREDENTIALS = {
    "admin": {
        "password": "admin123",
        "role": "admin"
    },
    "user": {
        "password": "user123",
        "role": "user"
    }
}

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345678",
        database="flights_db"
    )

def get_db_engine():
    return create_engine("mysql+pymysql://root:12345678@localhost/flights_db")