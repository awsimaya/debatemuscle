from functools import wraps
from flask import request, jsonify, g
from ..services.auth_service import decode_jwt_token
from ..models.user import User


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Try Authorization header first
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]

        # Fall back to query param (needed for <video> element which can't send headers)
        if not token:
            token = request.args.get('token')

        if not token:
            return jsonify(error='Missing or invalid authorization'), 401

        user_id = decode_jwt_token(token)
        if not user_id:
            return jsonify(error='Invalid or expired token'), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify(error='User not found'), 401

        g.current_user = user
        return f(*args, **kwargs)
    return decorated
