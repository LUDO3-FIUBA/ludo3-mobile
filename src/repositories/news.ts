import { baseUrl } from '../networking';
import SessionManager from '../managers/sessionManager';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import News, { NewsTag } from '../models/News';
import { get, deleteMethod } from './authenticatedRepository';

const BASE_URL = 'api/news';

async function authHeaders(): Promise<Record<string, string>> {
  const token = SessionManager.getInstance()?.getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface NewsImagePayload {
  uri: string;
  type: string;
  name: string;
}

export interface NewsPayload {
  title: string;
  description?: string;
  tag: string;
  picture?: NewsImagePayload | null;
}

export async function fetchAll(): Promise<News[]> {
  const data = (await get(BASE_URL)) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as News);
}

export async function fetchOne(id: number): Promise<News> {
  const data = await get(`${BASE_URL}/${id}`);
  return convertSnakeToCamelCase(data) as News;
}

export async function fetchTags(): Promise<NewsTag[]> {
  const data = (await get(`${BASE_URL}/tags`)) as any[];
  return data.map(t => convertSnakeToCamelCase(t) as NewsTag);
}

function buildFormData(payload: NewsPayload): FormData {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('tag', payload.tag);
  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }
  if (payload.picture) {
    formData.append('picture', payload.picture as any);
  }
  return formData;
}

export async function createNews(payload: NewsPayload): Promise<News> {
  const headers = await authHeaders();
  const response = await fetch(`${baseUrl}/${BASE_URL}/`, {
    method: 'POST',
    headers,
    body: buildFormData(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return convertSnakeToCamelCase(data) as News;
}

export async function updateNews(id: number, payload: NewsPayload): Promise<News> {
  const headers = await authHeaders();
  const response = await fetch(`${baseUrl}/${BASE_URL}/${id}/`, {
    method: 'PATCH',
    headers,
    body: buildFormData(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return convertSnakeToCamelCase(data) as News;
}

export async function deleteNews(id: number): Promise<void> {
  await deleteMethod(`${BASE_URL}/${id}`, {});
}

export default { fetchAll, fetchOne, fetchTags, createNews, updateNews, deleteNews };
