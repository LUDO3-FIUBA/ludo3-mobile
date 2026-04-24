import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

export type GoogleLandingSignInResult = {
  idToken: string;
  email?: string;
  hostedDomain?: string;
  emailVerified?: boolean;
};

let googleScriptLoadPromise: Promise<void> | null = null;
let googleIdentityInitialized = false;
let pendingResolve: ((value: GoogleLandingSignInResult) => void) | null = null;
let pendingReject: ((reason?: any) => void) | null = null;
let pendingTimeoutId: number | null = null;

function decodeJwtPayload(token: string): any {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    return JSON.parse(atob(paddedBase64));
  } catch {
    return null;
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  if (googleScriptLoadPromise) {
    return googleScriptLoadPromise;
  }

  googleScriptLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Sign-In web no esta disponible en este entorno'));
      return;
    }

    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });

  return googleScriptLoadPromise;
}

function clearPendingRequest() {
  if (pendingTimeoutId !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingTimeoutId);
  }
  pendingTimeoutId = null;
  pendingResolve = null;
  pendingReject = null;
}

function ensureGoogleIdentityInitialized() {
  const googleAccounts = (window as any).google?.accounts?.id;
  if (!googleAccounts) {
    throw new Error('Google Identity Services no esta disponible');
  }

  if (googleIdentityInitialized) {
    return googleAccounts;
  }

  googleAccounts.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    callback: (response: { credential?: string }) => {
      const resolve = pendingResolve;
      const reject = pendingReject;

      if (!resolve || !reject) {
        return;
      }

      if (!response?.credential) {
        clearPendingRequest();
        reject(new Error('No se pudo obtener el token de Google'));
        return;
      }

      const payload = decodeJwtPayload(response.credential);
      clearPendingRequest();
      resolve({
        idToken: response.credential,
        email: payload?.email,
        hostedDomain: payload?.hd,
        emailVerified: payload?.email_verified,
      });
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });

  googleIdentityInitialized = true;
  return googleAccounts;
}

async function signInWithGoogleWeb(): Promise<GoogleLandingSignInResult> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Falta GOOGLE_WEB_CLIENT_ID en el entorno');
  }

  if (typeof window === 'undefined') {
    throw new Error('Google Sign-In web no esta disponible en este entorno');
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    if (pendingResolve || pendingReject) {
      reject(new Error('Ya hay un inicio de sesion con Google en progreso'));
      return;
    }

    const googleAccounts = ensureGoogleIdentityInitialized();

    pendingResolve = resolve;
    pendingReject = reject;
    pendingTimeoutId = window.setTimeout(() => {
      const currentReject = pendingReject;
      clearPendingRequest();
      currentReject?.(new Error('No se pudo completar el inicio de sesion con Google'));
    }, 60000);

    googleAccounts.prompt();
  });
}

async function signInWithGoogleNative(): Promise<GoogleLandingSignInResult> {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.data?.idToken ?? '';
  const payload = idToken ? decodeJwtPayload(idToken) : null;

  return {
    idToken,
    email: userInfo.data?.user?.email,
    hostedDomain: payload?.hd,
    emailVerified: payload?.email_verified,
  };
}

export async function signInWithGoogleForLanding(): Promise<GoogleLandingSignInResult> {
  if (Platform.OS === 'web') {
    return signInWithGoogleWeb();
  }

  return signInWithGoogleNative();
}

export async function signOutGoogleForLanding(): Promise<void> {
  if (Platform.OS !== 'web') {
    await GoogleSignin.signOut();
  }
}

