import { http } from './httpClient';

export async function listDiscussions(): Promise<any[]> {
  return http('/forum', { method: 'GET' });
}

export async function createDiscussion(payload: { title: string; content: string; file?: File | null }): Promise<any> {
  const fd = new FormData();
  fd.append('title', payload.title || '');
  fd.append('content', payload.content || '');
  if (payload.file) fd.append('file', payload.file);
  return http('/forum', { method: 'POST', body: fd });
}

export async function addComment(discussionId: string, content: string): Promise<any> {
  return http(`/forum/${encodeURIComponent(discussionId)}/comment`, { method: 'POST', body: JSON.stringify({ content }) });
}

export async function listNotifications(): Promise<any[]> {
  return http('/notifications', { method: 'GET' });
}

