# python/video_processor.py
import yt_dlp
import uuid
from yt_dlp.utils import download_range_func
from pathlib import Path
from config import Config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self, config=None):
        # Initialize with default config if none provided
        self.config = config or Config()
        self.active_downloads = {}

    def _generate_download_id(self):
        """Generate a unique identifier for each download"""
        return str(uuid.uuid4())

    def _create_ydl_opts(self, download_id, format_id=None, start_time=None, end_time=None):
        """Create download options with proper configuration"""
        output_template = f'{self.config.DOWNLOAD_FOLDER}/{download_id}.%(ext)s'

        # Base options that are always included
        ydl_opts = {
            'format': format_id or self.config.DEFAULT_FORMAT,
            'outtmpl': output_template,
            'download_ranges' : download_range_func(None, [(start_time, end_time)]),
            'ffmpeg_location': self.config.FFMPEG_LOCATION,
            'force_keyframes_at_cuts': True,
            'postprocessors': [],
            'external_downloader': None,
        }
        return ydl_opts

    async def process_video(self, url, options=None):
        """
        Process a video with the given options
        Returns: Dict containing download ID and status information
        """
        try:
            download_id = self._generate_download_id()
            
            # Extract options or use defaults
            format_id = options.get('format_id', self.config.DEFAULT_FORMAT)
            start_time = options.get('start_time')
            end_time = options.get('end_time')
            
            # Create download options
            ydl_opts = self._create_ydl_opts(
                download_id=download_id,
                format_id=format_id,
                start_time=start_time,
                end_time=end_time
            )

            # Track this download
            self.active_downloads[download_id] = {
                'status': 'processing',
                'url': url,
                'options': options
            }

            # Perform the download
            with yt_dlp.YoutubeDL(params=ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                # Update download status
                self.active_downloads[download_id].update({
                    'status': 'completed',
                    'file_path': f'{self.config.DOWNLOAD_FOLDER}/{download_id}.{info["ext"]}',
                    'info': info
                })

            return {
                'download_id': download_id,
                'status': 'success',
                'info': self.active_downloads[download_id]
            }

        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            if download_id:
                self.active_downloads[download_id] = {
                    'status': 'failed',
                    'error': str(e)
                }
            return {
                'status': 'error',
                'message': str(e)
            }