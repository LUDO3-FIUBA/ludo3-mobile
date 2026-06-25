import { Platform } from 'react-native';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

// iOS requires either iosClientId or GoogleService-Info.plist; without it the
// native module rejects configure() and crashes the app at boot. Keep Google
// Sign-In disabled on iOS only while the iOS OAuth client is not provisioned,
// so DNI/password login keeps working in that case.
const googleSignInDisabled = Platform.OS === 'ios' && !GOOGLE_IOS_CLIENT_ID;

// The idToken's audience is always the webClientId (same Google Cloud project),
// so the backend keeps verifying against GOOGLE_CLIENT_ID unchanged. The
// iosClientId is only used to drive the native sign-in flow on iOS.
function googleConfig(extra: Record<string, unknown> = {}) {
  return {
    webClientId: GOOGLE_WEB_CLIENT_ID,
    ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
    ...extra,
  };
}

export function configureGoogle() {
  if (googleSignInDisabled || Platform.OS === 'web') return;
  // Dynamic import so the native module is never loaded on web
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure(googleConfig({ offlineAccess: true }));
}

function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('gis-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function getCalendarAccessTokenWeb(): Promise<string> {
  await loadGISScript();
  return new Promise<string>((resolve, reject) => {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_WEB_CLIENT_ID,
      scope: CALENDAR_SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.access_token);
        }
      },
    });
    tokenClient.requestAccessToken();
  });
}

export async function getCalendarAccessToken(): Promise<string> {
  if (Platform.OS === 'web') {
    return getCalendarAccessTokenWeb();
  }
  if (googleSignInDisabled) {
    throw new Error('Google Sign-In no está disponible en iOS todavía.');
  }
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure(
    googleConfig({
      scopes: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
    }),
  );
  await GoogleSignin.hasPlayServices();
  await GoogleSignin.signIn();
  const { accessToken } = await GoogleSignin.getTokens();
  configureGoogle();
  return accessToken;
}