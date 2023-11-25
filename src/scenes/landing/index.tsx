import React, { useState } from 'react';
import { View, Alert, Image } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { RoundedButton } from '../../components';
import { landing as style } from '../../styles';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
const LudoIcon = require('../../assets/ludo_icon.png');

interface Props {
  navigation: any;
}

const Landing = ({ navigation }: Props) => {
  const [loginInProgress, setLoginInProgress] = useState(false);
  const redirectUrl = 'org.erinc.ludo://oauth';

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
        console.log('alvaro user', user);

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

  return (
    <View style={style().view}>
      <Image source={LudoIcon} />
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
