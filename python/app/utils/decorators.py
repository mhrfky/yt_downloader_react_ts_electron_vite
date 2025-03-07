import functools
from sqlalchemy.exc import SQLAlchemyError
from app.models import Video

import logging

logger = logging.getLogger(__name__)

def transaction_handler(func):
    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        try:
            # Execute the function
            result = await func(self, *args, **kwargs)
            
            # If we got here without exceptions, commit the transaction
            self.db_session.commit()
            return result
            
        except Exception as e:
            # Roll back the transaction on any exception
            self.db_session.rollback()
            
            # Log the error
            logger.error(f"Transaction failed in {func.__name__}: {str(e)}")
            
            # Re-raise the exception for the caller to handle
            raise
            
    return wrapper


def log_function_call(func):
    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        current_app.logger.info(f"Calling {func.__name__}")
        try:
            result = await func(self, *args, **kwargs)
            current_app.logger.info(f"{func.__name__} completed successfully")
            return result
        except Exception as e:
            current_app.logger.error(f"{func.__name__} failed with error: {str(e)}")
            raise
    return wrapper

def update_video_upon_clip(func):
    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        try:
            result = await func(self, *args, **kwargs)
            video = Video.query.get(result.video_id)
            print("video is attempted to be updated upon clip creation")
            if video:
                video.updated_at = result.updated_at

            self.db_session.commit()

            return result
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Transaction failed in {func.__name__}: {str(e)}")
            return None
    return wrapper