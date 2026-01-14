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
  image: string,
): Promise<Object> {
  return post(`${authUrl}/users`, {
    dni,
    email,
    is_student: true,
    image: `${image}`,
  }).catch(error => {
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

/// 404: si el usuario no tiene el rol del SIU correspondiente al especificado
/// al registrarse en nuestras apps (ya sea porque no se registró o porque no
/// está en el SIU)
export function login(code: string, redirectUrl: string): Promise<Object> {
  return post(`${authUrl}/oauth`, {code, redirect_uri: redirectUrl}).catch(
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

export function refresh(token: string): Promise<Object> {
  return post(`${authUrl}/jwt/refresh`, {refresh: token});
}

export function classicLogin(dni: string): Promise<Object> {
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
  classicLogin,
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
