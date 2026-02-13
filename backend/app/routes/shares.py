from flask import Blueprint, request, jsonify, g
from ..middleware.auth_middleware import login_required
from ..models.video import Video
from ..models.share import VideoShare
from ..models.user import User
from ..models.comment import Comment
from ..extensions import db

shares_bp = Blueprint('shares', __name__)


@shares_bp.route('/videos/<int:video_id>/share', methods=['POST'])
@login_required
def share_video(video_id):
    video = Video.query.get_or_404(video_id)
    if video.user_id != g.current_user.id:
        return jsonify(error='Only the owner can share this video'), 403

    data = request.get_json()
    if not data:
        return jsonify(error='Request body required'), 400

    email = data.get('email', '').strip()
    if not email:
        return jsonify(error='Email is required'), 400

    target_user = User.query.filter_by(email=email).first()
    if not target_user:
        return jsonify(error='User not found with that email'), 404

    if target_user.id == g.current_user.id:
        return jsonify(error='Cannot share with yourself'), 400

    existing = VideoShare.query.filter_by(
        video_id=video_id,
        shared_with_user_id=target_user.id
    ).first()
    if existing:
        return jsonify(error='Video already shared with this user'), 409

    share = VideoShare(
        video_id=video_id,
        shared_by_user_id=g.current_user.id,
        shared_with_user_id=target_user.id,
    )
    db.session.add(share)
    db.session.commit()
    return jsonify(data=share.to_dict()), 201


@shares_bp.route('/videos/<int:video_id>/share/<int:user_id>', methods=['DELETE'])
@login_required
def revoke_share(video_id, user_id):
    video = Video.query.get_or_404(video_id)
    if video.user_id != g.current_user.id:
        return jsonify(error='Only the owner can revoke shares'), 403

    share = VideoShare.query.filter_by(
        video_id=video_id,
        shared_with_user_id=user_id
    ).first_or_404()

    db.session.delete(share)
    db.session.commit()
    return jsonify(message='Share revoked successfully')


@shares_bp.route('/videos/<int:video_id>/shares', methods=['GET'])
@login_required
def list_shares(video_id):
    video = Video.query.get_or_404(video_id)
    if video.user_id != g.current_user.id:
        return jsonify(error='Only the owner can view shares'), 403

    shares = VideoShare.query.filter_by(video_id=video_id).all()
    return jsonify(data=[s.to_dict() for s in shares])


@shares_bp.route('/reviews', methods=['GET'])
@login_required
def list_reviews():
    """Videos shared with the current user for review."""
    shares = VideoShare.query.filter_by(
        shared_with_user_id=g.current_user.id
    ).all()

    videos = []
    for share in shares:
        video_data = share.video.to_dict(include_comment_count=True)
        video_data['shared_by'] = share.shared_by.to_dict()
        video_data['shared_at'] = share.created_at.isoformat()
        videos.append(video_data)

    return jsonify(data=videos)


@shares_bp.route('/reviews/commented', methods=['GET'])
@login_required
def list_commented_reviews():
    """User's own videos that have received comments from other users (reviewers)."""
    videos = Video.query.filter_by(user_id=g.current_user.id).all()

    result = []
    for video in videos:
        review_comments = Comment.query.filter(
            Comment.video_id == video.id,
            Comment.user_id != g.current_user.id
        ).count()
        if review_comments > 0:
            video_data = video.to_dict()
            video_data['review_comment_count'] = review_comments
            result.append(video_data)

    return jsonify(data=result)
