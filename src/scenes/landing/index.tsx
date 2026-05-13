import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { RoundedButton } from '../../components';
import { landing as style } from '../../styles';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';
import { lightModeColors } from '../../styles/colorPalette';
import Svg, { Path } from 'react-native-svg';
import AlertDialog from '../../components/AlertDialog';
const LudoIcon = require('../../assets/ludo_icon.png');
import {
  renderGoogleWebSignInButton,
  signInWithGoogleForLanding,
  signOutGoogleForLanding,
  type GoogleLandingSignInResult,
} from '../../auth/google_landing_signin';

const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <Path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <Path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <Path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </Svg>
);

const EyeIcon = ({ size = 22, color = '#888' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z"/>
  </Svg>
);

const EyeOffIcon = ({ size = 22, color = '#888' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M12,7c2.76,0,5,2.24,5,5c0,0.65-0.13,1.26-0.36,1.83l2.92,2.92c1.51-1.26,2.7-2.89,3.43-4.75C21.27,7.61,17,4.5,12,4.5c-1.4,0-2.74,0.25-3.98,0.7l2.16,2.16C10.74,7.13,11.35,7,12,7z M2,4.27l2.28,2.28l0.46,0.46C3.08,8.3,1.78,10.02,1,12c1.73,4.39,6,7.5,11,7.5c1.55,0,3.03-0.3,4.38-0.84l0.42,0.42L19.73,22L21,20.73L3.27,3L2,4.27z M7.53,9.8l1.55,1.55C9.03,11.56,9,11.77,9,12c0,1.66,1.34,3,3,3c0.22,0,0.44-0.03,0.65-0.08l1.55,1.55C13.53,16.8,12.79,17,12,17c-2.76,0-5-2.24-5-5C7,11.21,7.2,10.47,7.53,9.8z M11.84,9.02L15,12.18l0.02-0.16C15.02,10.35,13.68,9,12,9L11.84,9.02z"/>
  </Svg>
);

type RetryAction = 'login' | 'google';

interface FormError {
  message: string;
  retryable: boolean;
  retryAction?: RetryAction;
  onReload?: () => void;
}

interface FormErrorBannerProps {
  formError: FormError;
  onRetry: () => void;
  onGoogleRetry: () => void;
  onClose: () => void;
}

const FormErrorBanner: React.FC<FormErrorBannerProps> = ({ formError, onRetry, onGoogleRetry, onClose }) => (
  <View style={bannerStyles.container}>
    <Text style={bannerStyles.message}>{formError.message}</Text>
    <View style={bannerStyles.actions}>
      {formError.onReload && (
        <TouchableOpacity onPress={formError.onReload}>
          <Text style={bannerStyles.actionText}>Recargar</Text>
        </TouchableOpacity>
      )}
      {formError.retryable && (
        <TouchableOpacity onPress={formError.retryAction === 'google' ? onGoogleRetry : onRetry}>
          <Text style={bannerStyles.actionText}>Reintentar</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onClose}>
        <Text style={bannerStyles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const isNetworkError = (e: any) => !!e?.isAxiosError && !e.response;
const isServerError = (e: any) =>
  (!!e?.response && e.response.status >= 500) ||
  /status code 5\d\d/i.test(e?.message ?? '');


interface Props {
  navigation: any;
}

const Landing = ({ navigation }: Props) => {
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [blockingError, setBlockingError] = useState<{ title: string; message: string } | null>(null);
  const clearAllErrors = () => {
    setDniError(null);
    setPasswordError(null);
    setFormError(null);
    setBlockingError(null);
  };

  const finalizeLogin = async (authResponse: any) => {
    const sessionManager: SessionManager = await SessionManager.getInstance()!;
    if (!sessionManager) {
      throw new Error('No se pudo inicializar la sesión');
    }
    await sessionManager.saveCredentials(authResponse);
    const user = await usersRepository.getInfo();

    if (!user.isStudent() && !user.isTeacher() && !user.isAdmin()) {
      throw new authenticationRepository.NotAStudent();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'RootDrawer' }],
    });
  };

  const handleCommonAuthErrors = (error: any): boolean => {
    if (error instanceof authenticationRepository.InvalidCredentials) {
      setDniError('');
      setPasswordError('');
      setPassword('');
      setFormError({ message: 'DNI o contraseña incorrectos.', retryable: false });
      return true;
    }
    if (error instanceof authenticationRepository.NotAStudent) {
      setFormError({ message: 'Tu cuenta no tiene permisos para ingresar.', retryable: false });
      return true;
    }
    if (error instanceof authenticationRepository.AccountNotApproved) {
      setBlockingError({
        title: 'Cuenta pendiente de aprobación',
        message: 'Admisión está verificando tu imagen.',
      });
      return true;
    }
    return false;
  };

  const handleGoogleAuthError = (error: any): boolean => {
    if (error instanceof authenticationRepository.NeedsRegistration) {
      navigation.navigate('GoogleRegister', {
        googleData: error.googleData,
      });
      return true;
    }
    if (error instanceof authenticationRepository.InvalidEmailDomain) {
      setFormError({ message: 'Usá tu correo @fi.uba.ar para ingresar con Google.', retryable: false });
      return true;
    }
    return handleCommonAuthErrors(error);
  };

  const handleLogin = async () => {
    clearAllErrors();

    if (!dni.trim()) {
      setDniError('Ingresá tu DNI');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Ingresá tu contraseña');
      return;
    }

    setLoginInProgress(true);

    try {
      const response = await authenticationRepository.login(dni.trim(), password);
      await finalizeLogin(response);
    } catch (error: any) {
      if (!handleCommonAuthErrors(error)) {
        if (isNetworkError(error)) {
          setFormError({ message: 'Sin conexión con el servidor.', retryable: true, retryAction: 'login' });
        } else if (isServerError(error)) {
          setFormError({ message: 'El servidor no respondió. Intentá en unos minutos.', retryable: true, retryAction: 'login' });
        } else {
          setBlockingError({ title: 'Error inesperado', message: error?.message || 'Error desconocido' });
        }
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleGoogleResult = async (result: GoogleLandingSignInResult) => {
    const email = (result.email ?? '').trim().toLowerCase();
    const hostedDomain = (result.hostedDomain ?? '').trim().toLowerCase();

    const isFiubaEmail = email.endsWith('@fi.uba.ar');
    const hasInvalidHostedDomain = hostedDomain.length > 0 && hostedDomain !== 'fi.uba.ar';

    if (!isFiubaEmail || hasInvalidHostedDomain) {
      throw new authenticationRepository.InvalidEmailDomain();
    }

    const response = await authenticationRepository.googleSignIn(result.idToken!);
    await finalizeLogin(response);
  };

  const signInWithGoogle = async () => {
    clearAllErrors();
    setLoginInProgress(true);
    try {
      const result = await signInWithGoogleForLanding();
      if (!result.idToken) {
        setFormError({ message: 'No pudimos completar el inicio con Google. Intentá de nuevo.', retryable: true, retryAction: 'google' });
        return;
      }
      await handleGoogleResult(result);
    } catch (error: any) {
      if (!handleGoogleAuthError(error)) {
        if (isNetworkError(error)) {
          setFormError({ message: 'Sin conexión con el servidor.', retryable: true, retryAction: 'google' });
        } else if (isServerError(error)) {
          setFormError({ message: 'El servidor no respondió. Intentá en unos minutos.', retryable: true, retryAction: 'google' });
        } else {
          setFormError({ message: 'No se pudo iniciar sesión con Google.', retryable: true, retryAction: 'google' });
        }
      }
      await signOutGoogleForLanding();
    } finally {
      setLoginInProgress(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    void renderGoogleWebSignInButton(
      'google-signin-container',
      async (result: GoogleLandingSignInResult) => {
        clearAllErrors();
        setLoginInProgress(true);
        try {
          if (!result.idToken) {
            setFormError({ message: 'No pudimos completar el inicio con Google. Intentá de nuevo.', retryable: true, retryAction: 'google' });
            return;
          }
          await handleGoogleResult(result);
        } catch (error: any) {
          if (!handleGoogleAuthError(error)) {
            if (isNetworkError(error)) {
              setFormError({ message: 'Sin conexión con el servidor.', retryable: true, retryAction: 'google' });
            } else if (isServerError(error)) {
              setFormError({ message: 'El servidor no respondió. Intentá en unos minutos.', retryable: true, retryAction: 'google' });
            } else {
              setFormError({ message: 'No se pudo iniciar sesión con Google.', retryable: true, retryAction: 'google' });
            }
          }
          await signOutGoogleForLanding();
        } finally {
          setLoginInProgress(false);
        }
      },
      (error: Error) => {
        setFormError({
          message: 'No pudimos cargar Google. Recargá la página.',
          retryable: false,
          onReload: () => window.location.reload(),
        });
      },
    );
  }, []);

  const webWidthStyle = Platform.OS === 'web'
    ? { width: '60%' as any, maxWidth: 480, alignSelf: 'center' as const }
    : {};

  return (
    <View style={style().view}>
      <View style={[styles.card, webWidthStyle]}>
        <View style={styles.cardItem}>
          <Image source={LudoIcon} style={{ width: 130, height: 130 }} />
          <View style={{flexDirection: 'column'}}>
          <Text style={styles.cardTitle}>LUDO</Text>
          <Text style={styles.cardLabel}>Libreta Universitaria</Text>
          <Text style={styles.cardLabel}>Digital Oficial</Text>
          </View>
        </View>
      </View>

      <View style={[styles.loginSection, webWidthStyle]}>
        <Text style={styles.dniLabel}>Ingresá tus datos:</Text>
        <TextInput
          style={[styles.dniInput, dniError !== null && styles.inputError]}
          placeholder="DNI"
          keyboardType="numeric"
          value={dni}
          onChangeText={(t) => { setDni(t); clearAllErrors(); }}
          editable={!loginInProgress}
        />
        {!!dniError && <Text style={styles.fieldErrorText}>{dniError}</Text>}

        <View style={[styles.passwordRow, passwordError !== null && styles.inputError]}>
          <TextInput
            style={styles.passwordTextInput}
            placeholder="Contraseña"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={(t) => { setPassword(t); clearAllErrors(); }}
            editable={!loginInProgress}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(v => !v)}
            disabled={loginInProgress}
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </TouchableOpacity>
        </View>
        {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

        {formError && (
          <FormErrorBanner
            formError={formError}
            onRetry={handleLogin}
            onGoogleRetry={signInWithGoogle}
            onClose={() => setFormError(null)}
          />
        )}

        <RoundedButton
          text="Ingresar"
          enabled={!loginInProgress && dni.trim().length > 0 && password.trim().length > 0}
          onPress={handleLogin}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordRequest')}
          disabled={loginInProgress}
        >
          <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

          {Platform.OS === 'web' ? (
            <View
              nativeID="google-signin-container"
              style={[styles.googleWebButtonContainer, loginInProgress && { opacity: 0.6 }]}
            />
          ) : (
            <TouchableOpacity
              style={[styles.googleButton, loginInProgress && { opacity: 0.6 }]}
              activeOpacity={0.7}
              onPress={signInWithGoogle}
              disabled={loginInProgress}
            >
              <View style={styles.googleIcon}>
                <GoogleLogo size={20} />
              </View>
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>
          )}
      </View>

      <View style={[styles.preregisterSection, webWidthStyle]}>
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

      <AlertDialog
        visible={blockingError !== null}
        title={blockingError?.title ?? ''}
        message={blockingError?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setBlockingError(null)}
      />
    </View>
  );
};

export default Landing;

const bannerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#664d03',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: lightModeColors.institutional,
  },
  closeText: {
    fontSize: 16,
    color: '#888',
    paddingLeft: 4,
  },
});

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
  inputError: {
    borderColor: lightModeColors.failed,
    marginBottom: 4,
  },
  fieldErrorText: {
    color: lightModeColors.failed,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 2,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  passwordTextInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeButton: {
    padding: 14,
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
  googleWebButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  forgotPasswordLink: {
    color: lightModeColors.institutional,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    textDecorationLine: 'underline',
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
