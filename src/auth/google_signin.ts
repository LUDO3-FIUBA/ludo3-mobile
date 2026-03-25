import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

export function configureGoogle() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export async function getCalendarAccessToken(): Promise<string> {
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
  // Restore original config so the login flow is unaffected
  configureGoogle();
  return accessToken;
}