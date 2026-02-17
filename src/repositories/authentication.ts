import {post, StatusCodeError} from '../networking';

const authUrl = 'auth';
const accountNotApprovedErrorCode = 'user_not_approved';

export class NotAStudent extends Error {
  constructor() {
    super('No eres un estudiante registrado en nuestra app');
    this.name = 'NotAStudent';
  }
}

export class NeedsRegistration extends Error {
  public googleData: any;
  
  constructor(googleData: any) {
    super('Usuario necesita completar registro');
    this.name = 'NeedsRegistration';
    this.googleData = googleData;
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

export class InvalidEmailDomain extends Error {
  constructor() {
    super('Solo se aceptan correos fi.uba.ar');
    this.name = 'InvalidEmailDomain';
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

export function login(dni: string, password: string): Promise<Object> {
  return post(`${authUrl}/login`, {dni, password}).catch(
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

export function googleSignIn(idToken: string): Promise<Object> {
  return post(`${authUrl}/google`, {id_token: idToken}).catch(
    (error: StatusCodeError) => {
      if (error instanceof StatusCodeError && error.code == 409) {
        return Promise.reject(new NeedsRegistration(error.info));
      }
      return Promise.reject(error);
    },
  );
}

export function googleRegistration(
  sub: string,
  email: string,
  dni: string,
  padron: string,
  password: string,
  firstName: string,
  lastName: string,
  isStudent: boolean = true,
  isTeacher: boolean = false,
): Promise<Object> {
  return post(`${authUrl}/google/registration`, {
    sub,
    email,
    dni,
    padron,
    password,
    first_name: firstName,
    last_name: lastName,
    is_student: isStudent,
    is_teacher: isTeacher,
  }).catch(error => {
    if (error instanceof StatusCodeError && error.fieldErrorIsBecauseOf('dni', 'unique')) {
      return Promise.reject(new InvalidDNI());
    }
    return Promise.reject(error);
  });
}

export default {
  preregister,
  login,
  refresh,
  googleSignIn,
  googleRegistration,
  NotAStudent,
  AccountNotApproved,
  InvalidImage,
  InvalidDNI,
  NeedsRegistration,
  InvalidEmailDomain,
};
