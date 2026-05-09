import {get, post} from './authenticatedRepository';
import {StatusCodeError} from '../networking';
import User from '../models/User';
import {Platform} from 'react-native';

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
      ),
    ),
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
  IdentityFail,
  FaceRegistrationPending,
  InvalidImage,
  registerFace,
  sendPushToken,
};
