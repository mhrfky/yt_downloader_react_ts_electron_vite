import asyncio
from app.core.events import EventEmitter
from app.core.exceptions import DuplicateResourceError
from app.core.exceptions import ResourceNotFoundError
from app.models.clip import Clip
from app.models.video import Video         
from app.services.video_service import VideoService
from app.core.exceptions import ClipNotFoundError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClipService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.event_emitter = EventEmitter.get_instance()
        
    async def create_clip(self, clip_data):
        """Create a new clip with business logic validation"""
        # Validate required fields
        required_fields = ['video_id', 'start_time', 'end_time', 'clip_id']
        for field in required_fields:
            if field not in clip_data:
                raise ValueError(f'Missing required field: {field}')
        
        # Validate time range
        if clip_data['start_time'] >= clip_data['end_time']:
            raise ValueError('Start time must be before end time')
        
        # Check if video exists
        video_service = VideoService(self.db_session)
        videoId, _ = await asyncio.create_task(video_service.create_or_get_video(clip_data['video_id']))
        
        # Check if clip_id already exists
        existing_clip = Clip.query.filter_by(clip_id=clip_data['clip_id']).first()
        if existing_clip:
            raise DuplicateResourceError('Clip ID already exists')
        
        # Create new clip
        new_clip = Clip(
            clip_id=clip_data['clip_id'],
            video_id=clip_data['video_id'],
            start_time=clip_data['start_time'],
            end_time=clip_data['end_time']
        )
        
        try:
            self.db_session.add(new_clip)
            self.db_session.commit()

            return new_clip
        except Exception as e:
            self.db_session.rollback()
            raise e
        
    def update_clip(self, clip_id, clip_data):
        logger.info("Updating clip in flask %s", clip_id)
        try:
            clip = self.db_session.query(Clip).filter_by(clip_id=clip_id).first()
            if not clip:
                logger.info("During update, the clip-id has not been found")
                return  # Or handle appropriately
            if 'start_time' in clip_data.keys():
                clip.start_time = clip_data['start_time']
                logger.info("Clip start time updated %f", clip_data['start_time'])
            if 'end_time' in clip_data.keys():
                clip.end_time = clip_data['end_time']
                logger.info("Clip end time updated %f", clip_data['end_time'])
            
            self.db_session.commit()
            logger.info("Clip updated successfully")
            return clip
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Failed to update clip data: {e}")
            return 
    def delete_clip(self, clip_id):
        clip = self.db_session.query(Clip).filter_by(clip_id=clip_id).first()

        if not clip:
            # Raise a custom exception if the clip is not found
            raise ClipNotFoundError(f"Clip_id : {clip_id} not found")

        try:
            self.db_session.delete(clip)
            self.db_session.commit()
            return True
        except Exception as e:
            self.db_session.rollback()
            raise e  # Or wrap/raise another custom exception if desired
        
    def get_clips(self):
        return Clip.query.all()

    def get_clip(self, clip_id):
        clip = Clip.query.filter_by(clip_id=clip_id).first()
        
        if not clip:
            return False
        
        return clip