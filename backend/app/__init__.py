import os
from flask import Flask
from .config import Config
from .extensions import db, migrate, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.videos import videos_bp
    from .routes.comments import comments_bp
    from .routes.shares import shares_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(videos_bp, url_prefix='/api/videos')
    app.register_blueprint(comments_bp, url_prefix='/api')
    app.register_blueprint(shares_bp, url_prefix='/api')

    return app
