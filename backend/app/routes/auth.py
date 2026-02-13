from flask import Blueprint, request, jsonify, g
from ..services.auth_service import register_user, authenticate_user, create_jwt_token
from ..middleware.auth_middleware import login_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify(error='Request body required'), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')
    display_name = data.get('display_name', '').strip()

    if not email or not password:
        return jsonify(error='Email and password are required'), 400
    if len(password) < 6:
        return jsonify(error='Password must be at least 6 characters'), 400

    user, error = register_user(email, password, display_name or None)
    if error:
        return jsonify(error=error), 409

    token = create_jwt_token(user.id)
    return jsonify(data={'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify(error='Request body required'), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify(error='Email and password are required'), 400

    user, error = authenticate_user(email, password)
    if error:
        return jsonify(error=error), 401

    token = create_jwt_token(user.id)
    return jsonify(data={'token': token, 'user': user.to_dict()})


@auth_bp.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify(data=g.current_user.to_dict())
