import asyncio
import logging
from flask import jsonify

from app.controllers.utils import serialize_clip
from app.services.clip_service import ClipService
from app.database import db
from app.core.exceptions import ClipNotFoundError, DuplicateResourceError
from app.services.download_clip_service import DownloadClipService

logger = logging.getLogger(__name__)

class ClipController:
    def __init__(self):
        self.clip_service = ClipService(db.session)



    async def get_clips(self):
        # Run the synchronous service method in a thread to avoid blocking
        clips = await asyncio.to_thread(self.clip_service.get_clips)
        serialized = [serialize_clip(clip) for clip in clips]
        return jsonify(serialized), 200

    async def get_clip(self, clip_id):
        clip = await asyncio.to_thread(self.clip_service.get_clip, clip_id)
        if not clip:
            return jsonify({'error': f'Clip_id : {clip_id} not found'}), 404
        return jsonify(serialize_clip(clip)), 200

    async def create_clip(self, data):
        logger.info("Creating new clip in flask")
        try:
            new_clip = await self.clip_service.create_clip(data)
            logger.info(f"Clip with id: {new_clip.clip_id} created successfully")
            return jsonify(serialize_clip(new_clip)), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except DuplicateResourceError as e:
            return jsonify({'error': str(e)}), 409
        except Exception as e:
            logger.error(f"Error creating clip: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    async def update_clip(self, clip_id, data):
        try:
            updated_clip = await self.clip_service.update_clip(clip_id, data)  # Direct await
            if not updated_clip:
                return jsonify({'error': f'Clip_id : {clip_id} not found'}), 404
            return jsonify(serialize_clip(updated_clip)), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Error updating clip: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    async def delete_clip(self, clip_id):
        try:
            await self.clip_service.delete_clip(clip_id)
            return jsonify({'message': 'Clip deleted successfully'}), 200
        except ClipNotFoundError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            logger.error(f"Error deleting clip: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500

    async def download_clip(self, json_data):
        downloader = DownloadClipService()
        logger.info("Downloading clip: %s", json_data)
        try:
            download_result = await asyncio.to_thread(downloader.download_clip_from_frontend, json_data["video_id"], json_data["start_time"], json_data["end_time"])
            if download_result['status'] == 'success':
                return jsonify(download_result), 200
            else:
                return jsonify({'error': download_result['message']}), 500
        except Exception as e:
            logger.error(f"Error downloading clip: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500

