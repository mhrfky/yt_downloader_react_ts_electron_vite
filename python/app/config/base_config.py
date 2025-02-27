# config/base_config.py

import os
from pathlib import Path

class Config:
    # Basic Application Settings
    APP_NAME = "Clip Processor"
    SECRET_KEY = os.environ.get("SECRET_KEY", "hard-to-guess-string")
    DEBUG = True
    TESTING = False

    # Clip Processing Settings
    DEFAULT_FORMAT = os.environ.get("DEFAULT_FORMAT", "best")
    MAX_CLIP_DURATION = int(os.environ.get("MAX_CLIP_DURATION", 300))  # 5 minutes
    MIN_CLIP_DURATION = int(os.environ.get("MIN_CLIP_DURATION", 1))    # 1 second

    # File Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

    # Base Directory: Use the project root (one level up from this file)
    BASE_DIR = Path(__file__).parent.parent.resolve()

    # Database Settings: Store the SQLite database in a "data" folder.
    DB_FOLDER = BASE_DIR / "data"
    DB_FOLDER.mkdir(exist_ok=True)  # Ensure the folder exists.
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_FOLDER / 'clips.db'}"

    # User Configurable Paths
    DOWNLOAD_FOLDER =  str(Path.home() / "Downloads" / "clips")
    FFMPEG_LOCATION = r"C:\ProgramData\chocolatey\bin\ffmpeg.exe"
    
