from .base_config import Config
from pathlib import Path

class ProductionConfig(Config):
    """Production configuration"""
    
    # Production paths
    DOWNLOAD_FOLDER = "/var/www/clips/downloads"
    FFMPEG_LOCATION = "/usr/bin/ffmpeg"
    
    # Future Database Settings
    DATABASE_URI = "mysql://user:pass@localhost/clips_prod"