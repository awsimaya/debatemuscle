import client from './client';

export async function shareVideo(videoId, email) {
  const { data } = await client.post(`/videos/${videoId}/share`, { email });
  return data.data;
}

export async function revokeShare(videoId, userId) {
  const { data } = await client.delete(`/videos/${videoId}/share/${userId}`);
  return data;
}

export async function listShares(videoId) {
  const { data } = await client.get(`/videos/${videoId}/shares`);
  return data.data;
}

export async function listReviews() {
  const { data } = await client.get('/reviews');
  return data.data;
}

export async function listCommentedReviews() {
  const { data } = await client.get('/reviews/commented');
  return data.data;
}
