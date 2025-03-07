from flask import Blueprint, request, jsonify
from app.controllers.video_controller import VideoController
import logging 
logger = logging.getLogger(__name__)

video_bp = Blueprint('video', __name__)
video_controller = VideoController()

@video_bp.route('', methods=['GET'])
async def get_all_videos():
    return await video_controller.get_all_videos()

@video_bp.route('/<video_id>', methods=['GET'])
async def get_video(video_id):
    return await video_controller.get_video(video_id)

@video_bp.route('/<video_id>/clips', methods=['GET'])
async def get_videos_clips(video_id):
    logger.info(f"trying to get the clips from vode with id: {video_id}")
    result = await video_controller.get_videos_clips(video_id)
    logger.info(f"get clips from video id result: {result}")
    return result

@video_bp.route('/<video_id>', methods=['DELETE'])
async def delete_video(video_id):
    return await video_controller.delete_video(video_id)

@video_bp.route('/update-info', methods=['UPDATE', 'PATCH'])
async def update_video_info():
    return await video_controller.update_video_info()