import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Define app data directory based on platform
def get_app_data_dir():
    app_name = "ClipProcessor"
    if os.name == 'nt':  # Windows
        app_data = os.environ.get('APPDATA')
        return Path(app_data) / app_name
    elif sys.platform == 'darwin':  # macOS
        return Path.home() / "Library" / "Application Support" / app_name
    else:  # Linux
        return Path.home() / ".config" / app_name

# Ensure app data directory exists
app_data_dir = get_app_data_dir()
os.makedirs(app_data_dir, exist_ok=True)

# Load or create .env file in app data directory
env_path = app_data_dir / ".env"
if not os.path.exists(env_path):
    # Create default .env file with original values
    with open(env_path, 'w') as f:
        f.write("""# Clip Processor Configuration
# User settings that persist between app updates

# Download location (default is your Downloads folder)
DOWNLOAD_FOLDER=

# FFMPEG location (default depends on platform)
FFMPEG_LOCATION=

# Default video format
DEFAULT_FORMAT=best

# Maximum clip duration in seconds
MAX_CLIP_DURATION=300

# Minimum clip duration in seconds
MIN_CLIP_DURATION=1
""")

# Load settings from .env file
load_dotenv(dotenv_path=env_path)

# Helper function to update configuration
def update_user_config(key, value):
    """Update a user configuration value in the .env file"""
    env_path = get_app_data_dir() / ".env"
    
    # Read existing content
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update or add the key
    key_found = False
    for i, line in enumerate(lines):
        if line.strip() and not line.startswith('#') and line.split('=')[0] == key:
            lines[i] = f"{key}={value}\n"
            key_found = True
            break
    
    if not key_found:
        lines.append(f"{key}={value}\n")
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    # Update environment variable in current process
    os.environ[key] = str(value)

from .base_config import Config
from .development import DevelopmentConfig
from .test import TestConfig
from .production import ProductionConfig

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestConfig,
    'default': DevelopmentConfig
}

# Export what should be available when importing from config
__all__ = ['config', 'Config', 'DevelopmentConfig', 'ProductionConfig', 'TestConfig', 'update_user_config']