import { Platform } from 'react-native';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

// iOS requires either iosClientId or GoogleService-Info.plist; until an iOS
// OAuth client is provisioned the native module rejects configure() and
// crashes the app at boot. Skip on iOS so DNI/password login keeps working.
const googleSignInDisabled = Platform.OS === 'ios';

export function configureGoogle() {
  if (googleSignInDisabled || Platform.OS === 'web') return;
  // Dynamic import so the native module is never loaded on web
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
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
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
  });
  await GoogleSignin.hasPlayServices();
  await GoogleSignin.signIn();
  const { accessToken } = await GoogleSignin.getTokens();
  configureGoogle();
  return accessToken;
}