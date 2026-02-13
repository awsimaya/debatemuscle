import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import VideoPlayer from '../components/videos/VideoPlayer';
import CommentThread from '../components/comments/CommentThread';
import CommentInput from '../components/comments/CommentInput';
import ShareModal from '../components/sharing/ShareModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getVideo, deleteVideo } from '../api/videos';
import { useAuth } from '../hooks/useAuth';

export default function VideoDetailPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getVideo(videoId)
      .then(setVideo)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleTimestampClick = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleDelete = async () => {
    await deleteVideo(videoId);
    navigate('/');
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner size="lg" />
      </PageLayout>
    );
  }

  if (!video) return null;

  const isOwner = video.user_id === user?.id;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-dm-muted hover:text-dm-text transition-colors mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Video Player */}
        <VideoPlayer ref={videoRef} videoId={video.id} />

        {/* Video Info */}
        <div className="mt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-dm-text">{video.title}</h1>
              <p className="text-sm text-dm-muted mt-1">
                by {video.owner?.display_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowShare(true)}
                    className="px-3 py-1.5 text-sm bg-dm-mid hover:bg-dm-mid/80 text-dm-light rounded-lg transition-colors"
                  >
                    Share
                  </button>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Delete?</span>
                      <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 font-medium">Yes</button>
                      <button onClick={() => setConfirmDelete(false)} className="text-xs text-dm-muted hover:text-dm-text">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {video.description && (
            <p className="text-sm text-dm-text/80 mt-3">{video.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-dm-mid/60 text-dm-light px-2.5 py-1 rounded-full">
              {video.tournament}
            </span>
            <span className="text-xs bg-dm-accent/20 text-dm-accent px-2.5 py-1 rounded-full">
              {video.division}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8 border-t border-dm-mid pt-6">
          <CommentInput
            videoRef={videoRef}
            videoId={video.id}
            onCommentAdded={() => setCommentRefresh((k) => k + 1)}
          />
          <div className="mt-6">
            <CommentThread
              videoId={video.id}
              onTimestampClick={handleTimestampClick}
              refreshKey={commentRefresh}
            />
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        video={video}
      />
    </PageLayout>
  );
}
