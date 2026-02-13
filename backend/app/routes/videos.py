import os
from flask import Blueprint, request, jsonify, g, current_app, Response, send_file
from ..middleware.auth_middleware import login_required
from ..models.video import Video
from ..services.video_service import save_video, delete_video, can_view_video

videos_bp = Blueprint('videos', __name__)


@videos_bp.route('', methods=['GET'])
@login_required
def list_videos():
    query = Video.query.filter_by(user_id=g.current_user.id)

    tournament = request.args.get('tournament')
    if tournament:
        query = query.filter_by(tournament=tournament)

    division = request.args.get('division')
    if division:
        query = query.filter_by(division=division)

    query = query.order_by(Video.created_at.desc())
    videos = query.all()
    return jsonify(data=[v.to_dict(include_comment_count=True) for v in videos])


@videos_bp.route('', methods=['POST'])
@login_required
def upload_video():
    file = request.files.get('file')
    if not file:
        return jsonify(error='No file provided'), 400

    title = request.form.get('title', '').strip()
    if not title:
        return jsonify(error='Title is required'), 400

    description = request.form.get('description', '').strip()
    tournament = request.form.get('tournament', '').strip()
    division = request.form.get('division', '').strip()

    if not tournament or not division:
        return jsonify(error='Tournament and division are required'), 400

    try:
        video = save_video(file, title, description, tournament, division, g.current_user.id)
    except ValueError as e:
        return jsonify(error=str(e)), 400

    return jsonify(data=video.to_dict()), 201


@videos_bp.route('/<int:video_id>', methods=['GET'])
@login_required
def get_video(video_id):
    video = Video.query.get_or_404(video_id)
    if not can_view_video(g.current_user.id, video):
        return jsonify(error='Access denied'), 403
    return jsonify(data=video.to_dict(include_comment_count=True))


@videos_bp.route('/<int:video_id>', methods=['DELETE'])
@login_required
def remove_video(video_id):
    video = Video.query.get_or_404(video_id)
    if video.user_id != g.current_user.id:
        return jsonify(error='Only the owner can delete this video'), 403
    delete_video(video)
    return jsonify(message='Video deleted successfully')


@videos_bp.route('/<int:video_id>/stream', methods=['GET'])
@login_required
def stream_video(video_id):
    video = Video.query.get_or_404(video_id)
    if not can_view_video(g.current_user.id, video):
        return jsonify(error='Access denied'), 403

    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], video.filename)
    if not os.path.exists(file_path):
        return jsonify(error='Video file not found'), 404

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get('Range')

    if range_header:
        byte_start = 0
        byte_end = file_size - 1

        range_match = range_header.replace('bytes=', '').split('-')
        if range_match[0]:
            byte_start = int(range_match[0])
        if range_match[1]:
            byte_end = int(range_match[1])

        byte_end = min(byte_end, file_size - 1)
        content_length = byte_end - byte_start + 1

        def generate():
            with open(file_path, 'rb') as f:
                f.seek(byte_start)
                remaining = content_length
                chunk_size = 8192
                while remaining > 0:
                    read_size = min(chunk_size, remaining)
                    data = f.read(read_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        return Response(
            generate(),
            status=206,
            mimetype=video.mime_type,
            headers={
                'Content-Range': f'bytes {byte_start}-{byte_end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': content_length,
            }
        )
    else:
        return send_file(file_path, mimetype=video.mime_type)
