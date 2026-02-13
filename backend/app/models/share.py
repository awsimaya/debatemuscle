from datetime import datetime, timezone
from ..extensions import db


class VideoShare(db.Model):
    __tablename__ = 'video_shares'

    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'), nullable=False, index=True)
    shared_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shared_with_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('video_id', 'shared_with_user_id', name='uq_video_shared_with'),
    )

    shared_by = db.relationship('User', foreign_keys=[shared_by_user_id], backref='shared_videos')
    shared_with = db.relationship('User', foreign_keys=[shared_with_user_id], backref='received_shares')

    def to_dict(self):
        return {
            'id': self.id,
            'video_id': self.video_id,
            'shared_by_user_id': self.shared_by_user_id,
            'shared_with_user_id': self.shared_with_user_id,
            'shared_by': self.shared_by.to_dict() if self.shared_by else None,
            'shared_with': self.shared_with.to_dict() if self.shared_with else None,
            'created_at': self.created_at.isoformat(),
        }
