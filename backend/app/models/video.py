from datetime import datetime, timezone
from ..extensions import db


class Video(db.Model):
    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Float, nullable=True)
    mime_type = db.Column(db.String(50), nullable=False)
    tournament = db.Column(db.String(50), nullable=False)
    division = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    comments = db.relationship('Comment', backref='video', lazy='dynamic', cascade='all, delete-orphan')
    shares = db.relationship('VideoShare', backref='video', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_comment_count=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'duration': self.duration,
            'mime_type': self.mime_type,
            'tournament': self.tournament,
            'division': self.division,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'owner': self.owner.to_dict() if self.owner else None,
        }
        if include_comment_count:
            data['comment_count'] = self.comments.count()
        return data
