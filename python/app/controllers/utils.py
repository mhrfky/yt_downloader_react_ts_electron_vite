def serialize_video(video):
    """Convert a Video model instance to a dictionary."""
    return {
        'videoId': video.video_id,
        'title': video.title,
        'duration': video.duration,
        'clips': [clip.id for clip in video.clips],  # assuming a relationship exists
        'thumbnail': video.thumbnail,
        'created_at': video.created_at.isoformat() if video.created_at else None,
        'updated_at': video.updated_at.isoformat() if video.updated_at else None
    }


def serialize_clip(clip):
    """Convert a Clip model instance to a serializable dictionary."""
    return {
        'id': clip.id,
        'clip_id': clip.clip_id,
        'video_id': clip.video_id,
        'start_time': clip.start_time,
        'end_time': clip.end_time,
        'created_at': clip.created_at.isoformat() if clip.created_at else None,
        'updated_at': clip.updated_at.isoformat() if clip.updated_at else None
    }
