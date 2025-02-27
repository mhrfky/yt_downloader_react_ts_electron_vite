#app/__init__.py
from flask import Flask
from app.config import config
from app.database import db

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Get config class from dictionary
    config_class = config[config_name]
    
    # Initialize config
    app.config.from_object(config_class)
    
    # Initialize database
    db.init_app(app)
    from app.models.video import Video
    from app.models.clip import Clip
    # Create tables within app context
    with app.app_context():
        db.create_all()
    
    # Register blueprints
    from app.routes.clip_routes import clip_bp
    app.register_blueprint(clip_bp, url_prefix='/api/v1/clips')
    from app.routes.video_routes import video_bp
    app.register_blueprint(video_bp, url_prefix='/api/v1/videos')
    return app