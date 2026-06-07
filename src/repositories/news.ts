import { Platform } from 'react-native';
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
  image?: NewsImagePayload | null;
  departmentId?: number | null;
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

async function buildFormData(payload: NewsPayload): Promise<FormData> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('tag', payload.tag);
  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }
  if (payload.departmentId !== undefined && payload.departmentId !== null) {
    formData.append('department_id', String(payload.departmentId));
  }
  if (payload.image) {
    if (Platform.OS === 'web') {
      // Browsers require a real Blob/File — fetch the blob: or data: URI and wrap it
      const res = await fetch(payload.image.uri);
      const blob = await res.blob();
      formData.append('image', new File([blob], payload.image.name, { type: payload.image.type }));
    } else {
      // React Native's FormData polyfill handles { uri, type, name } natively
      formData.append('image', payload.image as any);
    }
  }
  return formData;
}

export async function createNews(payload: NewsPayload): Promise<News> {
  const headers = await authHeaders();
  const response = await fetch(`${baseUrl}/${BASE_URL}/`, {
    method: 'POST',
    headers,
    body: await buildFormData(payload),
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
    body: await buildFormData(payload),
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
