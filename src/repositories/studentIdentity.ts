import { baseUrl, StatusCodeError } from '../networking';
import SessionManager from '../managers/sessionManager';

export interface StudentIdentity {
  firstName: string;
  lastName: string;
  dni: string;
  padron: string;
  image: string | null;
}

export class CredentialExpired extends Error {
  constructor() {
    super('La credencial está vencida o es inválida.');
    this.name = 'CredentialExpired';
  }
}

function normalizeImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `${baseUrl}${image}`;
  return image;
}

export async function fetchMyQRBase64(): Promise<string> {
  const token = SessionManager.getInstance()?.getAuthToken();
  if (!token) throw new Error('No auth token');

  const response = await fetch(`${baseUrl}/api/student_identity/my_qr/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new StatusCodeError(response.status);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function fetchIdentityByToken(token: string): Promise<StudentIdentity> {
  const response = await fetch(`${baseUrl}/api/student_identity/identity/${token}/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 404) {
      throw new CredentialExpired();
    }
    throw new StatusCodeError(response.status);
  }

  const json = await response.json();
  return {
    firstName: json.first_name,
    lastName: json.last_name,
    dni: json.dni,
    padron: json.padron,
    image: normalizeImageUrl(json.image),
  };
}

export async function fetchMyIdentityLink(): Promise<{ url: string; expiresInHours: number }> {
  const token = SessionManager.getInstance()?.getAuthToken();
  if (!token) throw new Error('No auth token');

  const response = await fetch(`${baseUrl}/api/student_identity/my_identity_link/`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new StatusCodeError(response.status);
  }

  const json = await response.json();
  return { url: json.url, expiresInHours: json.expires_in_hours };
}

export default { fetchMyQRBase64, fetchIdentityByToken, fetchMyIdentityLink, CredentialExpired };
