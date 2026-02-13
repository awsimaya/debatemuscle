import client from './client';

export async function listVideos(params = {}) {
  const { data } = await client.get('/videos', { params });
  return data.data;
}

export async function getVideo(videoId) {
  const { data } = await client.get(`/videos/${videoId}`);
  return data.data;
}

export async function uploadVideo(formData, onProgress) {
  const { data } = await client.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data.data;
}

export async function deleteVideo(videoId) {
  const { data } = await client.delete(`/videos/${videoId}`);
  return data;
}

export function getStreamUrl(videoId) {
  const token = localStorage.getItem('token');
  return `/api/videos/${videoId}/stream?token=${encodeURIComponent(token)}`;
}
