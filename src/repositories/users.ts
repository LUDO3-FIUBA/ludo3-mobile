import {get, post} from './authenticatedRepository.ts';
import {StatusCodeError} from '../networking';
import User from '../models/User.ts';
import {Platform} from 'react-native';

const domainUrl = 'auth/users';

export class IdentityFail extends Error {
  constructor() {
    super('No eres quien dices ser.');
    this.name = 'IdentityValidationFail';
  }
}

export function validate(image: string): Promise<User> {
  return post(`${domainUrl}/is_me`, {
    image: `'${image}'`,
  })
    .catch(error => {
      if (
        error instanceof StatusCodeError &&
        error.isBecauseOf('invalid_image')
      ) {
        // No face detected error
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
      ),
    ),
  );
}

export function sendPushToken(token): Promise<Void> {
  return post('api/device/gcm', {
    registration_id: token,
    cloud_message_type: Platform.OS == 'android' ? 'FCM' : 'APNS',
  });
}

export default {validate, getInfo, IdentityFail, sendPushToken};
