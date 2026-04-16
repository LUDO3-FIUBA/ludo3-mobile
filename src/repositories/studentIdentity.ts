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
    image: json.image ?? null,
  };
}

export default { fetchMyQRBase64, fetchIdentityByToken, CredentialExpired };
