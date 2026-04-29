import {post as publicPost, StatusCodeError} from '../networking';
import {post as authenticatedPost} from './authenticatedRepository';
import {refresh} from './refreshToken';

export {refresh};

const authUrl = 'auth';
const accountNotApprovedErrorCode = 'user_not_approved';
const unknownErrorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';

interface ForgotPasswordPayload {
  dni?: string;
  email?: string;
}

interface ResetPasswordConfirmPayload extends ForgotPasswordPayload {
  code: string;
  new_password: string;
}

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

export class InvalidCredentials extends Error {
  constructor() {
    super('El DNI o la contraseña son incorrectos.');
    this.name = 'InvalidCredentials';
  }
}

export function preregister(
  dni: string,
  email: string,
  padron: string,
  password: string,
  image?: string,
): Promise<object> {
  const body: any = {
    dni,
    email,
    padron,
    password,
    is_student: true,
  };
  if (image) {
    body.image = image;
  }
  return publicPost(`${authUrl}/users`, body).catch(error => {
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

export function login(dni: string, password: string): Promise<object> {
  return publicPost(`${authUrl}/login`, {dni, password}).catch(
    (error: StatusCodeError) => {
      if (error instanceof StatusCodeError && error.code === 404) {
        return Promise.reject(new NotAStudent());
      } else if (
        error instanceof StatusCodeError &&
        (error.info?.dni || error.info?.password)
      ) {
        return Promise.reject(new InvalidCredentials());
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

export interface GoogleSignInPayload {
  id_token?: string;
  authorization_code?: string;
  code_verifier?: string;
  redirect_uri?: string;
}

export function googleSignIn(payload: string | GoogleSignInPayload): Promise<object> {
  const requestBody: GoogleSignInPayload =
    typeof payload === 'string' ? { id_token: payload } : payload;

  return publicPost(`${authUrl}/google`, requestBody).catch(
    (error: StatusCodeError) => {
      if (error instanceof StatusCodeError && error.code === 409) {
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
): Promise<object> {
  return publicPost(`${authUrl}/google/registration`, {
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

export function changePassword(oldPassword: string, newPassword: string): Promise<object> {
  return authenticatedPost(`${authUrl}/password/change`, {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

export function forgotPassword(payload: ForgotPasswordPayload): Promise<object> {
  return publicPost(`${authUrl}/password/forgot`, payload);
}

export function resetPasswordConfirm(
  payload: ResetPasswordConfirmPayload,
): Promise<object> {
  return publicPost(`${authUrl}/password/reset/confirm`, payload);
}

function getFirstMessage(value: any): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    const firstItem = value[0];
    if (typeof firstItem === 'string') {
      return firstItem;
    }
    if (firstItem?.message && typeof firstItem.message === 'string') {
      return firstItem.message;
    }
  }
  if (value.message && typeof value.message === 'string') {
    return value.message;
  }
  return null;
}

export function getErrorMessage(
  error: unknown,
  fields: string[] = [],
  fallbackMessage = unknownErrorMessage,
): string {
  if (error instanceof StatusCodeError) {
    for (const field of fields) {
      const fieldMessage = getFirstMessage(error.info?.[field]);
      if (fieldMessage) {
        return fieldMessage;
      }
    }

    const genericMessage =
      getFirstMessage(error.info?.message) ||
      getFirstMessage(error.info?.detail) ||
      getFirstMessage(error.info?.non_field_errors) ||
      getFirstMessage(error.info);

    if (genericMessage) {
      return genericMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default {
  preregister,
  login,
  refresh,
  changePassword,
  forgotPassword,
  resetPasswordConfirm,
  getErrorMessage,
  googleSignIn,
  googleRegistration,
  NotAStudent,
  AccountNotApproved,
  InvalidImage,
  InvalidDNI,
  NeedsRegistration,
  InvalidEmailDomain,
  InvalidCredentials,
};
