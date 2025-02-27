
import logging
from app.utils.youtube_utils import download_clip

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DownloadClipService:
    def __init__(self):
        pass
    def download_clip_from_frontend(self, video_id, start_time, end_time):

        return download_clip(video_id, {'start_time': start_time, 'end_time': end_time})    

