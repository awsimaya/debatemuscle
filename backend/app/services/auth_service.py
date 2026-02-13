from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from flask import current_app
from ..models.user import User
from ..extensions import db


def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_jwt_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(
            hours=current_app.config['JWT_EXPIRATION_HOURS']
        ),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def register_user(email, password, display_name=None):
    if User.query.filter_by(email=email).first():
        return None, 'Email already registered'

    user = User(
        email=email,
        display_name=display_name or email.split('@')[0],
        password_hash=hash_password(password),
        auth_provider='mock',
    )
    db.session.add(user)
    db.session.commit()
    return user, None


def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash:
        return None, 'Invalid credentials'
    if not verify_password(password, user.password_hash):
        return None, 'Invalid credentials'

    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()
    return user, None
