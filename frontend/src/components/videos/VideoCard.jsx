import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteVideo } from '../../api/videos';
import { timeAgo, formatFileSize } from '../../utils/formatTime';

export default function VideoCard({ video, onDeleted, showOwner = false, showShareButton = false, onShareClick }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVideo(video.id);
      onDeleted?.(video.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-dm-surface border border-dm-mid rounded-xl overflow-hidden hover:border-dm-accent/40 transition-colors group">
      <Link to={`/video/${video.id}`} className="block">
        <div className="aspect-video bg-dm-dark flex items-center justify-center relative">
          <svg className="w-12 h-12 text-dm-muted/30 group-hover:text-dm-accent/50 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-xs text-white px-1.5 py-0.5 rounded">
              {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/video/${video.id}`}>
          <h3 className="text-sm font-medium text-dm-text truncate hover:text-dm-light transition-colors">
            {video.title}
          </h3>
        </Link>

        {showOwner && video.owner && (
          <p className="text-xs text-dm-muted mt-0.5">by {video.owner.display_name}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-xs bg-dm-mid/60 text-dm-light px-2 py-0.5 rounded-full">
            {video.tournament}
          </span>
          <span className="text-xs bg-dm-accent/20 text-dm-accent px-2 py-0.5 rounded-full">
            {video.division}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-dm-muted">
          <span>{timeAgo(video.created_at)}</span>
          <span>{formatFileSize(video.file_size)}</span>
        </div>

        {video.comment_count > 0 && (
          <div className="mt-2 text-xs text-dm-accent">
            {video.comment_count} comment{video.comment_count !== 1 ? 's' : ''}
          </div>
        )}

        {video.review_comment_count > 0 && (
          <div className="mt-2 text-xs text-green-400">
            {video.review_comment_count} review{video.review_comment_count !== 1 ? 's' : ''}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          {showShareButton && (
            <button
              onClick={(e) => { e.preventDefault(); onShareClick?.(video); }}
              className="text-xs text-dm-muted hover:text-dm-accent transition-colors"
            >
              Share
            </button>
          )}

          {onDeleted && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-red-400">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-dm-muted hover:text-dm-text"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-dm-muted hover:text-red-400 transition-colors ml-auto"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
