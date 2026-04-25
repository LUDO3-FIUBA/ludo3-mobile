import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

// iOS requires either iosClientId or GoogleService-Info.plist; until an iOS
// OAuth client is provisioned the native module rejects configure() and
// crashes the app at boot. Skip on iOS so DNI/password login keeps working.
const googleSignInDisabled = Platform.OS === 'ios';

export function configureGoogle() {
  if (googleSignInDisabled) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export async function getCalendarAccessToken(): Promise<string> {
  if (googleSignInDisabled) {
    throw new Error('Google Sign-In no está disponible en iOS todavía.');
  }
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