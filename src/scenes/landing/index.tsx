import React, { useState } from 'react';
import { View, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { RoundedButton } from '../../components';
import { landing as style } from '../../styles';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
import { lightModeColors } from '../../styles/colorPalette';
import Svg, { Path } from 'react-native-svg';
const LudoIcon = require('../../assets/ludo_icon.png');
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <Path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <Path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <Path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </Svg>
);

interface Props {
  navigation: any;
}

const Landing = ({ navigation }: Props) => {
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');

  const finalizeLogin = async (authResponse: any) => {
    const sessionManager: SessionManager = await SessionManager.getInstance()!;
    if (!sessionManager) {
      throw new Error('No se pudo inicializar la sesión');
    }
    await sessionManager.saveCredentials(authResponse);
    const user = await usersRepository.getInfo();

    if (!user.isStudent() && !user.isTeacher()) {
      throw new authenticationRepository.NotAStudent();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'RootDrawer' }],
    });
  };

  const handleCommonAuthErrors = (error: any) => {
    if (error instanceof authenticationRepository.NotAStudent) {
      showRoleError();
      return true;
    }
    if (error instanceof authenticationRepository.AccountNotApproved) {
      showAccountNotApprovedError();
      return true;
    }
    return false;
  };

  const handleGoogleAuthError = (error: any) => {
    if (error instanceof authenticationRepository.NeedsRegistration) {
      navigation.navigate('GoogleRegister', {
        googleData: error.googleData,
      });
      return true;
    }
    if (error instanceof authenticationRepository.InvalidEmailDomain) {
      showInvalidDomain();
      return true;
    }
    return handleCommonAuthErrors(error);
  };

  const handleLogin = async () => {
    if (!dni.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DNI');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setLoginInProgress(true);

    try {
      console.log('[Login] Starting login with DNI:', dni);
      const response = await authenticationRepository.login(dni.trim(), password);
      await finalizeLogin(response);

    } catch (error) {
      if (!handleCommonAuthErrors(error)) {
        console.error('[Login] Error details:', error);
        showGenericError(error);
      }
    } finally {
      setLoginInProgress(false);
      setDni('');
      setPassword('');
    }
  };

  const signInWithGoogle = async () => {
  setLoginInProgress(true);
    console.log('[Google Sign-In] Starting Google Sign-In process');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('[Google Sign-In] userInfo:', userInfo);

      const idToken = userInfo.data?.idToken;
      const email = userInfo.data?.user?.email;

      if (!idToken) {
        throw new Error('No se pudo obtener el token de Google');
      }

      if (!email || !email.endsWith('@fi.uba.ar')) {
        throw new authenticationRepository.InvalidEmailDomain();
      }

      const response = await authenticationRepository.googleSignIn(idToken);
      await finalizeLogin(response);
    } catch (error: any) {
      if (!handleGoogleAuthError(error)) {
        Alert.alert('Error', `No se pudo iniciar sesión con Google: ${error.message}`);
      }
      await GoogleSignin.signOut();
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

      <View style={styles.loginSection}>
        <Text style={styles.dniLabel}>Ingresá tus datos:</Text>
        <TextInput
          style={styles.dniInput}
          placeholder="DNI"
          keyboardType="numeric"
          value={dni}
          onChangeText={setDni}
          editable={!loginInProgress}
        />
        <TextInput
          style={styles.dniInput}
          placeholder="Contraseña"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!loginInProgress}
        />
        <RoundedButton
          text="Ingresar"
          enabled={!loginInProgress && dni.trim().length > 0 && password.trim().length > 0}
          onPress={handleLogin}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

          <TouchableOpacity
            style={[styles.googleButton, loginInProgress && { opacity: 0.6 }]}
            activeOpacity={0.7}
            onPress={signInWithGoogle}
            disabled={loginInProgress}
          >
            <View style={styles.googleIcon}>
              <GoogleLogo size={20} />
            </View>
            <Text style={styles.googleButtonText}>Continúa con Google</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.preregisterSection}>
        <Text style={styles.preregisterText}>
          ¿Es tu primera vez?{' '}
          <Text
            style={styles.preregisterLink}
            onPress={() => navigation.navigate('PreRegister')}
          >
            Realizá el pre-registro
          </Text>
        </Text>
      </View>
    </View>
  );
};

const showGenericError = (error?: any) => {
  const errorMsg = error?.message || error?.toString() || 'Error desconocido';
  Alert.alert(
    'Error de autenticación', 
    `No se pudo completar el inicio de sesión.\n\nDetalles: ${errorMsg}\n\nChequeá que hayas ingresado correctamente tus datos.`
  );
};

const showInvalidDomain = () => {
  Alert.alert(
    'Error',
    'Dominio de correo inválido. \nUtilizar correo FIUBA.'
  );
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
    'Chequeá que hayas ingresado correctamente tus datos.'
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
  loginSection: {
    width: '100%',
    marginBottom: 24,
  },
  dniLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  dniInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  preregisterSection: {
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  preregisterText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  preregisterLink: {
    color: lightModeColors.institutional,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
