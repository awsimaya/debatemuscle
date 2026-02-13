from flask import Blueprint, request, jsonify, g
from ..middleware.auth_middleware import login_required
from ..models.video import Video
from ..models.comment import Comment
from ..services.video_service import can_view_video
from ..extensions import db

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('/videos/<int:video_id>/comments', methods=['GET'])
@login_required
def list_comments(video_id):
    video = Video.query.get_or_404(video_id)
    if not can_view_video(g.current_user.id, video):
        return jsonify(error='Access denied'), 403

    sort = request.args.get('sort', 'created')

    if sort == 'timestamp':
        comments = Comment.query.filter_by(video_id=video_id) \
            .order_by(
                Comment.timestamp_seconds.is_(None),
                Comment.timestamp_seconds.asc()
            ).all()
    else:
        comments = Comment.query.filter_by(video_id=video_id) \
            .order_by(Comment.created_at.asc()).all()

    return jsonify(data=[c.to_dict() for c in comments])


@comments_bp.route('/videos/<int:video_id>/comments', methods=['POST'])
@login_required
def create_comment(video_id):
    video = Video.query.get_or_404(video_id)
    if not can_view_video(g.current_user.id, video):
        return jsonify(error='Access denied'), 403

    data = request.get_json()
    if not data:
        return jsonify(error='Request body required'), 400

    body = data.get('body', '').strip()
    if not body:
        return jsonify(error='Comment body is required'), 400

    timestamp_seconds = data.get('timestamp_seconds')
    if timestamp_seconds is not None:
        try:
            timestamp_seconds = float(timestamp_seconds)
            if timestamp_seconds < 0:
                return jsonify(error='Timestamp must be non-negative'), 400
        except (TypeError, ValueError):
            return jsonify(error='Invalid timestamp'), 400

    comment = Comment(
        video_id=video_id,
        user_id=g.current_user.id,
        body=body,
        timestamp_seconds=timestamp_seconds,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(data=comment.to_dict()), 201


@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != g.current_user.id:
        return jsonify(error='Only the author can delete this comment'), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify(message='Comment deleted successfully')
