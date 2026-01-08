import React, { useState } from 'react';
import { View, Alert, Image, StyleSheet, Text } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { RoundedButton } from '../../components';
import { landing as style } from '../../styles';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
import { lightModeColors } from '../../styles/colorPalette';
const LudoIcon = require('../../assets/ludo_icon.png');
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface Props {
  navigation: any;
}

const Landing = ({ navigation }: Props) => {
  const [loginInProgress, setLoginInProgress] = useState(false);
  const redirectUrl = 'org.fiuba.ludo://oauth';

  const handleLogin = async () => {
    setLoginInProgress(true);
    const config = {
      issuer: 'https://auth.fi.uba.ar/',
      clientId: 'ed6fdc77-51b0-4828-be5d-37d23d1b6880',
      redirectUrl,
      scopes: ['openid', 'profile', 'email'],
      response_type: 'code',
      skipCodeExchange: true,
      usePKCE: false,
      additionalParameters: {},
    };

    try {
      const { authorizationCode } = await authorize(config);
      const response = await authenticationRepository.login(
        authorizationCode,
        redirectUrl
      );
      const sessionManager: SessionManager = await SessionManager.getInstance()!;
      if (sessionManager) {
        sessionManager.saveCredentials(response);
        const user = await usersRepository.getInfo();

        if (!user.isStudent()) {
          throw new authenticationRepository.NotAStudent();
        }
        setLoginInProgress(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'RootDrawer' }],
        });
      }
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Home' }],
      // });
    } catch (error) {
      if (error instanceof authenticationRepository.NotAStudent) {
        showRoleError();
      } else if (error instanceof authenticationRepository.AccountNotApproved) {
        showAccountNotApprovedError();
      } else if (!isCancellationError(error as { message: string })) {
        console.log('Error', error);
        showGenericError();
      }
      setLoginInProgress(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoginInProgress(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Log the user info to see what's available
      console.log('Google Sign-In Success!');
      console.log('Full Response:', JSON.stringify(userInfo, null, 2));
      console.log('User ID:', userInfo.data?.user.id);
      console.log('Email:', userInfo.data?.user.email);
      console.log('Full Name:', userInfo.data?.user.name);
      console.log('Given Name:', userInfo.data?.user.givenName);
      console.log('Family Name:', userInfo.data?.user.familyName);
      console.log('Photo URL:', userInfo.data?.user.photo);
      
      // Show success alert with user info
      Alert.alert(
        'Google Sign-In Success',
        `Name: ${userInfo.data?.user.name}\nEmail: ${userInfo.data?.user.email}`
      );
      
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', `Google Sign-In failed: ${error.message}`);
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <View style={style().view}>
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <Image source={LudoIcon} style={{ width: 130, height: 130 }} />
          <View style={{flexDirection: 'column'}}>
          <Text style={styles.cardTitle}>LUDO</Text>
          <Text style={styles.cardLabel}>Libreta Universitaria</Text>
          <Text style={styles.cardLabel}>Digital Oficial</Text>
          </View>
        </View>
      </View>
      <RoundedButton
        text="Pre-registro"
        enabled={!loginInProgress}
        onPress={() => navigation.navigate('PreRegister')}
      />
      <RoundedButton
        text="Iniciar sesión"
        enabled={!loginInProgress}
        onPress={handleLogin}
      />
      <RoundedButton
        text="Iniciar sesión con Google"
        enabled={!loginInProgress}
        onPress={signInWithGoogle}
      />
    </View>
  );
};

const isCancellationError = (error: { message: string }) => {
  return (
    error.message === 'User cancelled flow' ||
    error.message === 'The operation couldn’t be completed. (org.openid.appauth.general error -3.)'
  );
};

const showGenericError = () => {
  Alert.alert('Error', 'Chequeá que hayas ingresado correctamente tus datos.');
};

const showAccountNotApprovedError = () => {
  Alert.alert(
    'Error',
    'Tu cuenta no ha sido aprobada aún. Probablemente Admisión esté ' +
    'verificando la imagen subida.'
  );
};

const showRoleError = () => {
  Alert.alert(
    'Error',
    '¿Te has registrado? ' +
    'Te recordamos que esta app es para alumnos. Si lo sos, ' +
    'chequeá que hayas ingresado correctamente tus datos.'
  );
};

export default Landing;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 28,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    gap: 18
  },
  cardItem: {
    flexDirection: 'row',
    margin: 18,
    alignItems: 'center',
    gap: 14
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  cardLabel: {
    fontSize: 18,
    color: 'gray',
  },
});
