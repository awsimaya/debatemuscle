import { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import VideoGrid from '../components/videos/VideoGrid';
import VideoCard from '../components/videos/VideoCard';
import UploadModal from '../components/videos/UploadModal';
import ShareModal from '../components/sharing/ShareModal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listVideos } from '../api/videos';
import { listCommentedReviews } from '../api/shares';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [reviewedVideos, setReviewedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [shareVideo, setShareVideo] = useState(null);

  const loadData = async () => {
    try {
      const [vids, reviewed] = await Promise.all([
        listVideos(),
        listCommentedReviews(),
      ]);
      setVideos(vids);
      setReviewedVideos(reviewed);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleted = (videoId) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setReviewedVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  return (
    <PageLayout>
      {/* My Videos Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dm-text">My Videos</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-dm-accent hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Video
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          description="Upload your first debate video to get started"
          action={
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-dm-accent hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              Upload Video
            </button>
          }
        />
      ) : (
        <VideoGrid>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDeleted={handleDeleted}
              showShareButton
              onShareClick={setShareVideo}
            />
          ))}
        </VideoGrid>
      )}

      {/* Videos With Reviews Section */}
      {reviewedVideos.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-dm-text mb-4">Videos With Reviews</h2>
          <p className="text-sm text-dm-muted mb-4">
            Videos you shared for review that have received feedback
          </p>
          <VideoGrid>
            {reviewedVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
              />
            ))}
          </VideoGrid>
        </div>
      )}

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={loadData}
      />

      <ShareModal
        isOpen={!!shareVideo}
        onClose={() => setShareVideo(null)}
        video={shareVideo}
      />
    </PageLayout>
  );
}
