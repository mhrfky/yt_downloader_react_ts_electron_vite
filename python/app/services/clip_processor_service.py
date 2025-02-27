import yt_dlp
import uuid
from yt_dlp.utils import download_range_func
import logging
from app.config.base_config import Config


logger = logging.getLogger(__name__)

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
    }
    return ydl_opts

def process_clip(url, options=None):
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
            'info': info
        }
    
    except Exception as e:
        logger.error(f"Error processing clip: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }
