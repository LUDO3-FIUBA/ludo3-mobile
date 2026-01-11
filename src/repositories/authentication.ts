import {post, StatusCodeError} from '../networking';

const authUrl = 'auth';
const accountNotApprovedErrorCode = 'user_not_approved';

export class NotAStudent extends Error {
  constructor() {
    super('No eres un estudiante registrado en nuestra app');
    this.name = 'NotAStudent';
  }
}

export class AccountNotApproved extends Error {
  constructor() {
    super(
      'Tu cuenta no ha sido aprobada aún por Admisión. Probablemente falte verificar las fotos subidas.',
    );
    this.name = 'AccountNotApproved';
  }
}

export class InvalidImage extends Error {
  constructor() {
    super('No es una imagen válida');
    this.name = 'InvalidImage';
  }
}

export class InvalidDNI extends Error {
  constructor() {
    super('No es un DNI válido');
    this.name = 'InvalidDNI';
  }
}

export function preregister(
  dni: string,
  email: string,
  padron: string,
  password: string,
  image?: string,  // Comentado: imagen ahora es opcional (antes era requerida para captura facial)
): Promise<Object> {
  const body: any = {
    dni,
    email,
    padron,
    password,
    is_student: true,
  };
  // Comentado: campo de imagen para captura facial
  // if (image) {
  //   body.image = image;
  // }
  return post(`${authUrl}/users`, body).catch(error => {
    // Check for: No face detected error
    if (
      error instanceof StatusCodeError &&
      error.isBecauseOf('invalid_image')
    ) {
      return Promise.reject(new InvalidImage());
    } else if (
      error instanceof StatusCodeError &&
      error.fieldErrorIsBecauseOf('dni', 'unique')
    ) {
      return Promise.reject(new InvalidDNI());
    }
    return Promise.reject(error);
  });
}

export function refresh(token: string): Promise<Object> {
  return post(`${authUrl}/jwt/refresh`, {refresh: token});
}

export function login(dni: string): Promise<Object> {
  return post(`${authUrl}/login`, {dni}).catch(
    (error: StatusCodeError) => {
      if (error instanceof StatusCodeError && error.code == 404) {
        return Promise.reject(new NotAStudent());
      } else if (
        error instanceof StatusCodeError &&
        error.isBecauseOf(accountNotApprovedErrorCode)
      ) {
        return Promise.reject(new AccountNotApproved());
      }
      return Promise.reject(error);
    },
  );
}

export default {
  preregister,
  login,
  refresh,
  NotAStudent,
  AccountNotApproved,
  InvalidImage,
  InvalidDNI,
};
