import client from './client';

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function register(email, password, display_name) {
  const { data } = await client.post('/auth/register', { email, password, display_name });
  return data.data;
}

export async function getMe() {
  const { data } = await client.get('/auth/me');
  return data.data;
}
