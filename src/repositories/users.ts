import {get, post, patch} from './authenticatedRepository';
import {StatusCodeError} from '../networking';
import User from '../models/User';
import {Platform} from 'react-native';
import SessionManager from '../managers/sessionManager';
import {baseUrl} from '../networking';

const domainUrl = 'auth/users';

export class IdentityFail extends Error {
  constructor() {
    super('No eres quien dices ser.');
    this.name = 'IdentityValidationFail';
  }
}

export class FaceRegistrationPending extends Error {
  constructor() {
    super('Registro facial incompleto.');
    this.name = 'FaceRegistrationPending';
  }
}

export class InvalidImage extends Error {
  constructor() {
    super('No es una imagen válida.');
    this.name = 'InvalidImage';
  }
}

export function validate(image: string): Promise<User> {
  return post(`${domainUrl}/is_me`, {
    image: `'${image}'`,
  })
    .catch(error => {
      if (
        error instanceof StatusCodeError &&
        error.isBecauseOf('face_registration_pending')
      ) {
        return Promise.reject(new FaceRegistrationPending());
      }
      if (
        error instanceof StatusCodeError &&
        error.isBecauseOf('invalid_image')
      ) {
        return Promise.reject(new IdentityFail());
      }
      return Promise.reject(error);
    })
    .then(json => {
      if (!json.match) {
        return Promise.reject(new IdentityFail());
      }
      return getInfo();
    });
}

export function registerFace(image: string): Promise<void> {
  return post(`${domainUrl}/register_face`, {image}).catch(error => {
    if (
      error instanceof StatusCodeError &&
      error.isBecauseOf('invalid_image')
    ) {
      return Promise.reject(new InvalidImage());
    }
    return Promise.reject(error);
  });
}

// Example JSON:
// {
//     "first_name": "Sopa",
//     "last_name": "Quick",
//     "email": "sopa@quick.com",
//     "dni": "38111222"
// }
export function getInfo(): Promise<User> {
  return get(`${domainUrl}/me`).then(json =>
    Promise.resolve(
      new User(
        json.dni,
        json.first_name,
        json.last_name,
        json.email,
        json.is_student ? json.file : null,
        json.is_teacher || false,
        json.is_staff || false,
        json.face_registered === true,
        json.github_url ?? '',
        json.is_superuser === true,
        json.department_id ?? null,
        json.linkedin_url ?? '',
        json.is_bedelia === true,
        json.profile_photo ?? null,
        json.secretary_id ?? null,
      ),
    ),
  );
}

export function updateGithubUrl(url: string): Promise<void> {
  return patch(`${domainUrl}/me`, { github_url: url }).then(() => Promise.resolve());
}

export function updateLinkedinUrl(url: string): Promise<void> {
  return patch(`${domainUrl}/me`, { linkedin_url: url }).then(() => Promise.resolve());
}

export function removeProfilePhoto(): Promise<void> {
  return patch(`${domainUrl}/me`, { profile_photo: null }).then(() => Promise.resolve());
}

export interface ProfilePhotoPayload {
  uri: string;
  type: string;
  name: string;
}

export async function uploadProfilePhoto(image: ProfilePhotoPayload): Promise<User> {
  const token = SessionManager.getInstance()?.getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  if (Platform.OS === 'web') {
    const res = await fetch(image.uri);
    const blob = await res.blob();
    formData.append('image', new File([blob], image.name, { type: image.type }));
  } else {
    formData.append('image', image as any);
  }

  const response = await fetch(`${baseUrl}/${domainUrl}/upload_profile_photo/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(json));

  return new User(
    json.dni,
    json.first_name,
    json.last_name,
    json.email,
    json.is_student ? json.file : null,
    json.is_teacher || false,
    json.is_staff || false,
    json.face_registered === true,
    json.github_url ?? '',
    json.is_superuser === true,
    json.department_id ?? null,
    json.linkedin_url ?? '',
    json.is_bedelia === true,
    json.profile_photo ?? null,
  );
}

export function sendPushToken(token: string) {
  return post('api/device/gcm', {
    registration_id: token,
    cloud_message_type: Platform.OS == 'android' ? 'FCM' : 'APNS',
  });
}

export default {
  validate,
  getInfo,
  updateGithubUrl,
  updateLinkedinUrl,
  uploadProfilePhoto,
  removeProfilePhoto,
  IdentityFail,
  FaceRegistrationPending,
  InvalidImage,
  registerFace,
  sendPushToken,
};
