import asyncio
import logging
from flask import jsonify

from app.controllers.utils import serialize_video
from app.services.video_service import VideoService
from app.database import db
from app.core.exceptions import VideoNotFoundError
from .utils import serialize_clip
import asyncio
logger = logging.getLogger(__name__)

class VideoController:
    def __init__(self):
        self.video_service = VideoService(db.session)

    async def get_all_videos(self):
        # Wrap the synchronous call so it runs in a separate thread
        videos = await asyncio.to_thread(self.video_service.get_all_videos)
        serialized = [serialize_video(video) for video in videos]
        return jsonify(serialized), 200

    async def get_video(self, video_id):
        video = await asyncio.to_thread(self.video_service.get_video, video_id)
        if video:
            return jsonify(serialize_video(video)), 200
        return jsonify({'message': 'Video not found'}), 404

    async def delete_video(self, video_id):
        try:
            await asyncio.to_thread(self.video_service.delete_video, video_id)
            return jsonify({'message': 'Video deleted successfully'}), 200
        except VideoNotFoundError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            logger.error(f"Error deleting video: {e}")
            return jsonify({'error': 'An unexpected error occurred'}), 500
    
    async def get_videos_clips(self, video_id):
        try:
            logger.info(f"trying to get the clips from vode with id: {video_id}")
            clips = await self.video_service.get_videos_clips(video_id)
            logger.info([serialize_clip(clip) for clip in clips])
            return jsonify([serialize_clip(clip) for clip in clips]), 200
        except VideoNotFoundError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            logger.error(f"Error getting clips: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500

    async def update_video_info(self):
        try:
            logger.info(f"attempting to update video info")
            videos = await asyncio.to_thread(self.video_service.get_all_videos)
            for video in videos:
                await self.video_service.update_video_async(video.video_id)
            return jsonify({'message': 'Video info updated successfully'}), 200
        except Exception as e:
            logger.error(f"Error updating video info: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500