from pathlib import Path
import os

class Config:
    # Base configuration that can be easily modified
    DOWNLOAD_FOLDER = str(Path.home() / "Downloads")
    FFMPEG_LOCATION = r'C:\ProgramData\chocolatey\bin\ffmpeg.exe'
    DEFAULT_FORMAT = 'best'
    
    # We can override these settings during initialization
    def __init__(self, custom_config=None):
        if custom_config:
            for key, value in custom_config.items():
                setattr(self, key, value)