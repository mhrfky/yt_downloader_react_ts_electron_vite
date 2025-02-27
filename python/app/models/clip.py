#app/models/clip.py
from app.database import db
from datetime import datetime
import uuid

class Clip(db.Model):
    __tablename__ = 'clips'
    
    id = db.Column(db.Integer, primary_key=True)
    clip_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.video_id'), nullable=False)
    start_time = db.Column(db.Float, nullable=False)
    end_time = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    video = db.relationship('Video', back_populates='clips')


    def __repr__(self):
        return f'<Clip {self.clip_id}>'