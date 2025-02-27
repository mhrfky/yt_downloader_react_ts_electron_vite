# app/database/__init__.py

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config.base_config import Config

# Initialize the synchronous SQLAlchemy instance for Flask.
db = SQLAlchemy()

# -------------------------------
# Asynchronous Database Setup
# -------------------------------
# Convert the synchronous SQLite URI from Config to the async URI format.
sync_url = Config.SQLALCHEMY_DATABASE_URI  # e.g., "sqlite:///path/to/clips.db"
if sync_url.startswith("sqlite://"):
    async_url = sync_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
else:
    async_url = sync_url

# Create an async engine. Setting echo=True logs SQL statements.
async_engine = create_async_engine(async_url, echo=True)

# Create an async session factory.
# Use this factory in your async endpoints to acquire an AsyncSession.
get_session = async_sessionmaker(async_engine, expire_on_commit=False)

# -------------------------------
# For Debugging: Print Out Config Values
# -------------------------------
if __name__ == "__main__":
    from pathlib import Path
    print("APP_NAME:", Config.APP_NAME)
    print("SQLALCHEMY_DATABASE_URI:", Config.SQLALCHEMY_DATABASE_URI)
    print("Async URL:", async_url)
    print("DOWNLOAD_FOLDER:", Config.DOWNLOAD_FOLDER)
    print("FFMPEG_LOCATION:", Config.FFMPEG_LOCATION)
    print("MAX_CLIP_DURATION:", Config.MAX_CLIP_DURATION)