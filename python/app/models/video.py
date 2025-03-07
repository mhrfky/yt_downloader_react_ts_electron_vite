#app/models/video.py
from app.database import db
from datetime import datetime

class Video(db.Model):
    __tablename__ = 'videos'
    
    video_id = db.Column(db.String(20), unique=True, nullable=False, primary_key=True)
    title = db.Column(db.String(255))
    duration = db.Column(db.Integer)  # Duration in seconds
    thumbnail = db.Column(db.VARCHAR(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    clips = db.relationship('Clip', back_populates='video', cascade='all, delete-orphan')