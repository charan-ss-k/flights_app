from flask import Blueprint, jsonify, request
from app_utils import USER_CREDENTIALS

login_bp = Blueprint('login', __name__)

@login_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username in USER_CREDENTIALS and USER_CREDENTIALS[username]["password"] == password:
        return jsonify({
            "success": True,
            "role": USER_CREDENTIALS[username]["role"],
            "username": username
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401