import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

export type GoogleLandingSignInResult = {
  idToken: string;
  email?: string;
  hostedDomain?: string;
  emailVerified?: boolean;
};

type GoogleCredentialResponse = {
  credential?: string;
};

let googleScriptLoadPromise: Promise<void> | null = null;
const GOOGLE_GIS_LOCALE = 'es';

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

    const scriptSrc = `https://accounts.google.com/gsi/client?hl=${GOOGLE_GIS_LOCALE}`;
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });

  return googleScriptLoadPromise;
}

export async function renderGoogleWebSignInButton(
  containerId: string,
  onCredential: (result: GoogleLandingSignInResult) => void,
  onError: (error: Error) => void,
): Promise<void> {
  if (Platform.OS !== 'web') {
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    onError(new Error('Falta GOOGLE_WEB_CLIENT_ID en el entorno'));
    return;
  }

  if (typeof window === 'undefined') {
    onError(new Error('Google Sign-In web no esta disponible en este entorno'));
    return;
  }

  await loadGoogleIdentityScript();

  const container = document.getElementById(containerId);
  if (!container) {
    onError(new Error('No se encontro el contenedor para el boton de Google'));
    return;
  }

  const googleAccounts = (window as any).google?.accounts?.id;
  if (!googleAccounts) {
    onError(new Error('Google Identity Services no esta disponible'));
    return;
  }

  container.innerHTML = '';

  const onLoadDiv = document.createElement('div');
  onLoadDiv.id = 'g_id_onload';
  onLoadDiv.setAttribute('data-client_id', GOOGLE_WEB_CLIENT_ID);
  onLoadDiv.setAttribute('data-auto_prompt', 'false');
  onLoadDiv.setAttribute('data-ux_mode', 'popup');
  container.appendChild(onLoadDiv);

  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'g_id_signin';
  container.appendChild(buttonDiv);

  googleAccounts.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    callback: (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        onError(new Error('No se pudo obtener el token de Google'));
        return;
      }

      const payload = decodeJwtPayload(response.credential);
      onCredential({
        idToken: response.credential,
        email: payload?.email,
        hostedDomain: payload?.hd,
        emailVerified: payload?.email_verified,
      });
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: false,
  });

  googleAccounts.renderButton(buttonDiv, {
    type: 'standard',
    size: 'large',
    theme: 'outline',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: 320,
    locale: GOOGLE_GIS_LOCALE,
  });
}

export async function signInWithGoogleForLanding(): Promise<GoogleLandingSignInResult> {
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

export async function signOutGoogleForLanding(): Promise<void> {
  if (Platform.OS !== 'web') {
    await GoogleSignin.signOut();
  }
}
