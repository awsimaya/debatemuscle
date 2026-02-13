import { useState } from 'react';
import TimestampBadge from './TimestampBadge';
import { createComment } from '../../api/comments';

export default function CommentInput({ videoRef, videoId, onCommentAdded }) {
  const [body, setBody] = useState('');
  const [linkedTime, setLinkedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const captureCurrentTime = () => {
    if (videoRef?.current) {
      setLinkedTime(videoRef.current.currentTime);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await createComment(videoId, body.trim(), linkedTime);
      setBody('');
      setLinkedTime(null);
      onCommentAdded?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        className="w-full bg-dm-dark border border-dm-mid rounded-lg px-3 py-2 text-dm-text text-sm focus:outline-none focus:border-dm-accent transition-colors resize-none"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={captureCurrentTime}
            className="text-xs text-dm-muted hover:text-dm-accent transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Link to current time
          </button>
          {linkedTime !== null && (
            <TimestampBadge
              seconds={linkedTime}
              onClear={() => setLinkedTime(null)}
              removable
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-red-400 text-xs">{error}</span>}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-4 py-1.5 text-sm bg-dm-accent hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}
