import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogle() {
  GoogleSignin.configure({
    webClientId: '1059998034268-3mo10gno2npc4q9n12rffk968k90bb6v.apps.googleusercontent.com',
    offlineAccess: true,
  });
}