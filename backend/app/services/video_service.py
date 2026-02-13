import os
import uuid
from flask import current_app
from ..models.video import Video
from ..models.share import VideoShare
from ..extensions import db
from ..utils.validators import allowed_file, validate_tournament, validate_division


def save_video(file, title, description, tournament, division, user_id):
    if not file or not file.filename:
        raise ValueError('No file provided')

    if not allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'unknown'
        raise ValueError(f'File type .{ext} not allowed')

    validate_tournament(tournament)
    validate_division(division)

    ext = file.filename.rsplit('.', 1)[1].lower()
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], safe_name)

    file.save(file_path)
    file_size = os.path.getsize(file_path)

    video = Video(
        user_id=user_id,
        title=title,
        description=description,
        filename=safe_name,
        original_filename=file.filename,
        file_size=file_size,
        mime_type=file.content_type or 'video/mp4',
        tournament=tournament,
        division=division,
    )
    db.session.add(video)
    db.session.commit()
    return video


def delete_video(video):
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], video.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    db.session.delete(video)
    db.session.commit()


def can_view_video(user_id, video):
    if video.user_id == user_id:
        return True
    share = VideoShare.query.filter_by(
        video_id=video.id,
        shared_with_user_id=user_id
    ).first()
    return share is not None
