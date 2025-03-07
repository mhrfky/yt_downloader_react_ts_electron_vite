import asyncio
from app.core.events import EventEmitter
from app.core.exceptions import DuplicateResourceError
from app.core.exceptions import ResourceNotFoundError
from app.models.clip import Clip
from app.models.video import Video         
from app.services.video_service import VideoService
from app.core.exceptions import ClipNotFoundError
import logging
from app.utils.decorators import update_video_upon_clip
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClipService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.event_emitter = EventEmitter.get_instance()
    
    @update_video_upon_clip
    async def create_clip(self, clip_data):
        logger.info("Starting clip creation.")
        
        # Validate required fields
        required_fields = ['video_id', 'start_time', 'end_time', 'clip_id']
        for field in required_fields:
            if field not in clip_data:
                raise ValueError(f'Missing required field: {field}')
        
        # Validate time range
        if clip_data['start_time'] >= clip_data['end_time']:
            raise ValueError('Start time must be before end time')
        
        # Create or get the video first
        logger.info(f"Creating or getting video for clip {clip_data['clip_id']}")
        video_service = VideoService(self.db_session)
        video, _ = await video_service.create_or_get_video(clip_data['video_id'])
        
        logger.info(f"Video retrieved or created: {video}")

        # Check if it's the first clip for the video
        existing_clip = Clip.query.filter_by(clip_id=clip_data['clip_id']).first()
        if not existing_clip:
            # Proceed with creating the clip
            new_clip = Clip(
                clip_id=clip_data['clip_id'],
                video_id=clip_data['video_id'],
                start_time=clip_data['start_time'],
                end_time=clip_data['end_time']
            )
            try:
                self.db_session.add(new_clip)
                self.db_session.commit()
                logger.info(f"Clip {clip_data['clip_id']} created successfully.")
                return new_clip
            except Exception as e:
                self.db_session.rollback()
                logger.error(f"Error creating clip: {e}")
                raise e
        else:
            logger.warning(f"Clip already exists for video {clip_data['video_id']}")
            raise ValueError(f"Clip already exists for video {clip_data['video_id']}")
    
    @update_video_upon_clip
    async def update_clip(self, clip_id, clip_data):
        logger.info("Updating clip in flask %s", clip_id)
        try:
            # Query for the clip
            clip = self.db_session.query(Clip).filter_by(clip_id=clip_id).first()
            if not clip:
                logger.info("During update, the clip-id has not been found")
                return None
                
            # Update the clip attributes
            if 'start_time' in clip_data.keys():
                clip.start_time = clip_data['start_time']
                logger.info("Clip start time updated %f", clip_data['start_time'])
            if 'end_time' in clip_data.keys():
                clip.end_time = clip_data['end_time']
                logger.info("Clip end time updated %f", clip_data['end_time'])
            
            # Explicitly mark the object as modified
            self.db_session.add(clip)  # This line is important!
            
            # Commit the changes
            self.db_session.commit()
            logger.info("Clip updated successfully")
            
            # Return the updated clip
            return clip
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Failed to update clip data: {str(e)}")
            raise e  # Re-raise to let the decorator handle it

    async def delete_clip(self, clip_id):
        clip = self.db_session.query(Clip).filter_by(clip_id=clip_id).first()

        if not clip:
            # Raise a custom exception if the clip is not found
            raise ClipNotFoundError(f"Clip_id : {clip_id} not found")

        try:
            self.db_session.delete(clip)
            self.db_session.commit()
            return clip
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