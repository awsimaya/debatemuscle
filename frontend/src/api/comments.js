import client from './client';

export async function listComments(videoId, sort = 'created') {
  const { data } = await client.get(`/videos/${videoId}/comments`, { params: { sort } });
  return data.data;
}

export async function createComment(videoId, body, timestampSeconds = null) {
  const payload = { body };
  if (timestampSeconds !== null) {
    payload.timestamp_seconds = timestampSeconds;
  }
  const { data } = await client.post(`/videos/${videoId}/comments`, payload);
  return data.data;
}

export async function deleteComment(commentId) {
  const { data } = await client.delete(`/comments/${commentId}`);
  return data;
}
