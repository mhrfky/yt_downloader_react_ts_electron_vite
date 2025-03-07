from flask import Blueprint, request, jsonify
from app.controllers.clip_controller import ClipController
import logging

logger = logging.getLogger(__name__)

clip_bp = Blueprint('clip', __name__)
clip_controller = ClipController()



@clip_bp.route('/<clip_id>', methods=['GET'])
async def get_clip(clip_id):
    return await clip_controller.get_clip(clip_id)

@clip_bp.route('/', methods=['GET'])
async def get_clips():
    logger.info("getting clips")
    return await clip_controller.get_clips()

@clip_bp.route('/', methods=['POST'])
async def add_new_clip():
    logger.info("Adding new clip in flask")
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    json_data = request.get_json()
    return await clip_controller.create_clip(json_data)

@clip_bp.route('/<clip_id>', methods=['PATCH'])
async def update_clip(clip_id):
    logger.info("Updating clip in flask")
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    json_data = request.get_json()
    return await clip_controller.update_clip(clip_id, json_data)

@clip_bp.route('/<clip_id>', methods=['DELETE'])
async def delete_clip(clip_id):
    return await clip_controller.delete_clip(clip_id)

@clip_bp.route('/download', methods=['POST'])
async def download_clip():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    json_data = request.get_json()
    logger.info("Downloading clip")

    return await clip_controller.download_clip(json_data)