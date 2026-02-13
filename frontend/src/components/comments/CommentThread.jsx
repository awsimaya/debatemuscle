import { useState, useEffect } from 'react';
import TimestampBadge from './TimestampBadge';
import { listComments, deleteComment } from '../../api/comments';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/formatTime';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CommentThread({ videoId, onTimestampClick, refreshKey }) {
  const [comments, setComments] = useState([]);
  const [sort, setSort] = useState('created');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadComments = async () => {
    try {
      const data = await listComments(videoId, sort);
      setComments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [videoId, sort, refreshKey]);

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner size="sm" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-dm-text">
          Comments ({comments.length})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dm-muted">Sort by:</span>
          <button
            onClick={() => setSort('created')}
            className={`text-xs px-2 py-0.5 rounded ${sort === 'created' ? 'bg-dm-mid text-dm-light' : 'text-dm-muted hover:text-dm-text'} transition-colors`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort('timestamp')}
            className={`text-xs px-2 py-0.5 rounded ${sort === 'timestamp' ? 'bg-dm-mid text-dm-light' : 'text-dm-muted hover:text-dm-text'} transition-colors`}
          >
            Timestamp
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-dm-muted text-center py-6">No comments yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-dm-dark rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dm-text">
                    {comment.author?.display_name}
                  </span>
                  {comment.timestamp_seconds !== null && (
                    <TimestampBadge
                      seconds={comment.timestamp_seconds}
                      onClick={onTimestampClick}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dm-muted">{timeAgo(comment.created_at)}</span>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-dm-muted hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-dm-text/90 mt-1.5 whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
