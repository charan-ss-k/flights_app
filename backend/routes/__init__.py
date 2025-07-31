from flask import Flask
from .arrivals import arrivals_bp
from .departures import departures_bp
from .all_flights import all_flights_bp
from .login import login_bp

def register_blueprints(app: Flask):
    app.register_blueprint(arrivals_bp)
    app.register_blueprint(departures_bp)
    app.register_blueprint(all_flights_bp)
    app.register_blueprint(login_bp)