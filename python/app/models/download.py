from app.database import db
from datetime import datetime
import uuid

class Download(db.Model):
    __tablename__ = 'downloads'
    
    id = db.Column(db.Integer, primary_key=True)
    clip_id = db.Column(db.String(50), db.ForeignKey('clips.clip_id'), nullable=True)
    playlist_id = db.Column(db.String(50), nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.utcnow)