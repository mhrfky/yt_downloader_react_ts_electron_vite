import yt_dlp
from app.config.base_config import Config
import logging
from yt_dlp.utils import download_range_func
import uuid
import os
import pathlib

logger = logging.getLogger(__name__)

def fetch_youtube_metadata(youtube_url):
    """
    Retrieve metadata for a YouTube video using yt-dlp.
    
    :param youtube_url: Full YouTube URL or video ID.
    :return: A dictionary containing metadata such as title, duration, etc.
    """
    # Set options to prevent actual download of the video; just want metadata
    ydl_opts = {
        'quiet': True,         # Reduce console output
        'no_warnings': True,   # Hide youtube-dl / ffmpeg warnings
        'skip_download': True  # Do not download the video file
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # If you only have the video ID (like 'abc123'), you can build the full URL:
        # youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        
        dict = ydl.extract_info(youtube_url, download=False)
        return {"title": dict["title"], "thumbnail" : dict["thumbnail"], "duration" : dict["duration"]}        
    
def get_video_id(video_input: str) -> str:
    """
    If video_input is a YouTube URL containing "www.youtube.com",
    extract and return the video ID found after '?v='.
    Otherwise, assume video_input is already the video ID and return it.
    """
    if "www.youtube.com" in video_input:
        marker = "?v="
        start_index = video_input.find(marker)
        if start_index != -1:
            start_index += len(marker)
            # Find end of video ID if additional parameters are present
            end_index = video_input.find("&", start_index)
            if end_index == -1:
                return video_input[start_index:]
            else:
                return video_input[start_index:end_index]
    # Otherwise, just return the original input
    return video_input


def _generate_download_id():
    """Generate a unique ID for each download."""
    return str(uuid.uuid4())

def _create_ydl_opts(download_id, start_time=None, end_time=None, format_id=None):
    """Create yt_dlp options based on configuration and provided parameters."""
    output_template = f'{Config.DOWNLOAD_FOLDER}/{download_id}.%(ext)s'
    
    ydl_opts = {
        'format': format_id or Config.DEFAULT_FORMAT,
        'outtmpl': output_template,
        'download_ranges': download_range_func(None, [(start_time, end_time)]),
        'ffmpeg_location': Config.FFMPEG_LOCATION,
        'force_keyframes_at_cuts': True,
        'postprocessors': [],
        'external_downloader': None,
        'quiet': True,         # Suppress console output from yt-dlp
        'no_warnings': True,   # Hide warnings
    }
    print(Config.FFMPEG_LOCATION, os.path.exists(Config.FFMPEG_LOCATION))
    return ydl_opts

def download_clip(url, options=None):
    """
    Process a clip download given a URL and options.
    
    options: a dictionary that can include:
        - format_id: specific format to download
        - start_time: starting time of the segment
        - end_time: ending time of the segment
    """
    options = options or {}
    download_id = _generate_download_id()
    
    try:
        format_id = options.get('format_id', Config.DEFAULT_FORMAT)
        start_time = options.get('start_time')
        end_time = options.get('end_time')
        
        ydl_opts = _create_ydl_opts(download_id, start_time, end_time, format_id)
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
        
        file_path = f"{Config.DOWNLOAD_FOLDER}/{download_id}.{info.get('ext')}"
        
        return {
            'download_id': download_id,
            'status': 'success',
            'file_path': file_path,
            'message': 'Clip downloaded successfully'
        }
    
    except Exception as e:
        logger.error(f"Error processing clip: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }
