import threading
import asyncio
import logging
from flask import current_app  # Import current_app for pushing the context
from app.database import db
from app.models.video import Video
from app.utils.youtube_utils import fetch_youtube_metadata
from app.database import get_session
from app.core.exceptions import VideoNotFoundError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self, db_session=None):
        self.db_session = db_session or db.session

    def get_video(self, video_id):
        return self.db_session.query(Video).filter_by(video_id=video_id).first()

    async def create_or_get_video(self, video_id, title=None, duration=None):
        logger.info("Creating or getting video in flask %s", video_id)
        video = self.get_video(video_id)
        if video:
            return video, False

        video = Video(
            video_id=video_id,
            title=title or f"Video {video_id}",
            duration=duration
        )
        
        logger.info(f"Video to be added is created: {video}")

        try:
            self.db_session.add(video)
            logger.info("Flushing the video to the database.")
            self.db_session.flush()
            logger.info(f"Video flushed, state: {video}")

            # After flushing, commit the transaction to make the video persistent
            self.db_session.commit()
            logger.info("Video committed successfully.")

            # Start the background update thread after committing
            self._fire_update_in_background(video_id)

            return video, True
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Error creating video: {e}")
            raise e

    def _fire_update_in_background(self, video_id):
        """
        Starts a new thread that pushes the application context
        and runs the asynchronous update.
        """
        # Capture the current application (not the proxy)
        app = current_app._get_current_object()

        def run_update():
            # Push the app context in this new thread
            with app.app_context():
                asyncio.run(self.update_video_async(video_id))

        # Start a new thread for the background update process
        thread = threading.Thread(target=run_update, daemon=True)
        thread.start()

    async def update_video_async(self, video_id):
        """
        Asynchronously update the video metadata using its own event loop.
        This function now runs inside an app context (from _fire_update_in_background).
        """
        # Assuming get_session returns an async-compatible session
        async_session = get_session()
        try:
            # Using SQLAlchemy async API to fetch the video
            from sqlalchemy import select
            result = await async_session.execute(select(Video).filter_by(video_id=video_id))
            video = result.scalars().first()
            if not video:
                logger.info("During update, the video-id has not been found")
                return  
            # Offload the blocking metadata fetch if needed
            metadata = await asyncio.to_thread(fetch_youtube_metadata, video_id)
            logger.info("Metadata fetched: %s", metadata)
            video.title = metadata["title"]
            video.duration = metadata["duration"]
            video.thumbnail = metadata["thumbnail"]
            logger.info("Video metadata updated: %s %i", video.title, video.duration)
            await async_session.commit()
        except Exception as e:
            await async_session.rollback()
            logger.error(f"Failed to update video metadata: {e}")
        finally:
            await async_session.close()
    async def get_videos_clips(self, video_id):
        try:
            video = self.db_session.query(Video).filter_by(video_id=video_id).first()
            if not video:
                return []
            return video.clips
        except VideoNotFoundError as e:
            return []
        except Exception as e:
            logger.error(f"Error getting clips: {str(e)}")
            return []
        
    def get_all_videos(self):
        return self.db_session.query(Video).all()

    def delete_video(self, video_id):
        try:
            video = self.db_session.query(Video).filter_by(video_id=video_id).first()
            if not video:
                raise VideoNotFoundError("Video not found")
            self.db_session.delete(video)
            self.db_session.commit()
            return True
        except Exception as e:
            self.db_session.rollback()
            raise e
