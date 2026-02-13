import { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import VideoGrid from '../components/videos/VideoGrid';
import VideoCard from '../components/videos/VideoCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listReviews } from '../api/shares';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReviews()
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-dm-text mb-2">Reviews</h1>
      <p className="text-sm text-dm-muted mb-6">Videos shared with you for review</p>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews to do"
          description="When someone shares a video with you for review, it will appear here"
        />
      ) : (
        <VideoGrid>
          {reviews.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              showOwner
            />
          ))}
        </VideoGrid>
      )}
    </PageLayout>
  );
}
