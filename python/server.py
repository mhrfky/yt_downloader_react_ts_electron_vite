from flask import Flask, request, jsonify
from video_processor import VideoProcessor
from config import Config
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize our video processor with default config
video_processor = VideoProcessor()

@app.route('/process', methods=['POST'])
async def process():
    """
    Process a video with the given options
    Expected JSON body: {
        "url": "video_url",
        "options": {
            "format_id": "best",
            "start_time": 3002,
            "end_time": 3022
        }
    }
    """
    try:
        data = request.json
        print(data)

        url = data.get('url')
        options = data.get('options', {})
        
        if not url:
            return jsonify({"error": "URL is required"}), 400

        result = await video_processor.process_video(url, options)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in process endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/status/<download_id>', methods=['GET'])
def get_status(download_id):
    """Get the status of a specific download"""
    status = video_processor.active_downloads.get(download_id)
    if status:
        return jsonify(status)
    return jsonify({"error": "Download not found"}), 404

@app.route('/downloads', methods=['GET'])
def get_all_downloads():
    """Get status of all downloads"""
    return jsonify(video_processor.active_downloads)

if __name__ == '__main__':
    app.run(port=5000)