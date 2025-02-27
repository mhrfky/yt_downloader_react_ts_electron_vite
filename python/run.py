# ./run.py
import os
from app import create_app
from app.config import config 
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Get environment from environment variable, default to 'development'
env = os.getenv('FLASK_ENV', 'development')

app = create_app(env)

if __name__ == '__main__':
    app.run(port=5000)