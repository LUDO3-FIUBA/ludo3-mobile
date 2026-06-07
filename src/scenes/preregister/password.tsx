import React, { useState, FunctionComponent } from 'react';
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, PasswordInput } from '../../components';
import AlertDialog from '../../components/AlertDialog';
import { authenticationRepository } from '../../repositories';
import FacePictureConfiguration from './face_recognition';

interface Props {
  navigation: any;
  route: any;
}

const PreRegisterPasswordScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { role = 'student', dni, padron, legajo, email, firstName, lastName } = route.params ?? {};
  const isTeacher = role === 'teacher';
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [blockingError, setBlockingError] = useState<{ title: string; message: string } | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const passwordValid = password.length > 0;

  const webWidthStyle = Platform.OS === 'web'
    ? { width: '60%' as any, maxWidth: 480, alignSelf: 'center' as const }
    : {};

  const goToFaceCapture = () => {
    navigation.navigate('TakePicture', {
      configuration: new FacePictureConfiguration(
        ['Tomate una foto de frente'],
        dni,
        padron,
        password
      ).toObject(),
      title: 'Pre-registro',
    });
  };

  const registerTeacher = async () => {
    setRegistering(true);
    try {
      await authenticationRepository.preregisterTeacher(dni, legajo, email, firstName, lastName, password);
      navigation.navigate('PreRegisterDone');
    } catch (error: any) {
      if (error instanceof authenticationRepository.InvalidDNI) {
        setBlockingError({
          title: 'DNI ya registrado',
          message: 'Chequeá haberlo ingresado correctamente. De ser correcto, contactate con Admisión para resetear la cuenta asociada a este DNI.',
        });
      } else {
        setBlockingError({
          title: 'Error inesperado',
          message: 'Hubo un error inesperado. Intentá nuevamente en unos minutos.',
        });
      }
    } finally {
      setRegistering(false);
    }
  };

  const registerWithoutFace = async () => {
    setRegistering(true);
    try {
      await authenticationRepository.preregister(dni, padron, password);
      navigation.navigate('PreRegisterDone');
    } catch (error: any) {
      if (error instanceof authenticationRepository.InvalidDNI) {
        setBlockingError({
          title: 'DNI ya registrado',
          message: 'Chequeá haberlo ingresado correctamente. De ser correcto, contactate con Admisión para resetear la cuenta asociada a este DNI.',
        });
      } else {
        setBlockingError({
          title: 'Error inesperado',
          message: 'Hubo un error inesperado. Intentá nuevamente en unos minutos.',
        });
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style().scrollView}
        >
          <View style={webWidthStyle}>
            <View style={style().inputLabels}>
              <Text style={style().text}>
                Contraseña
              </Text>
            </View>
            {!isTeacher && (
              <Text style={[style().text, { fontSize: 14, marginBottom: 12, opacity: 0.8 }]}>
                Ingresá la misma contraseña que usás en el SIU Guaraní
              </Text>
            )}
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder={isTeacher ? 'Elegí una contraseña' : 'Contraseña del SIU Guaraní'}
              editable={!registering}
            />
            <RoundedButton
              text={
                registering
                  ? 'Registrando...'
                  : isTeacher
                    ? 'Registrarme'
                    : 'Siguiente'
              }
              enabled={passwordValid && !registering}
              style={style().button}
              onPress={isTeacher ? registerTeacher : goToFaceCapture}
            />
            {!isTeacher && (
              <TouchableOpacity
                disabled={!passwordValid || registering}
                onPress={() => setShowSkipConfirm(true)}
                style={{ alignItems: 'center', marginTop: 12, padding: 10 }}
              >
                <Text
                  style={{
                    color: passwordValid && !registering ? '#4a90e2' : '#9aa0a6',
                    fontSize: 15,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                  }}
                >
                  Continuar sin foto
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <AlertDialog
        visible={showSkipConfirm}
        title="¿Continuar sin foto?"
        message="Vas a poder registrarte, pero tendrás que completar el registro facial desde tu perfil antes de poder dar presente en clases o finales."
        mode="confirm"
        confirmLabel="Continuar sin foto"
        cancelLabel="Cancelar"
        onConfirm={() => { setShowSkipConfirm(false); registerWithoutFace(); }}
        onCancel={() => setShowSkipConfirm(false)}
      />

      <AlertDialog
        visible={blockingError !== null}
        title={blockingError?.title ?? ''}
        message={blockingError?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => { setBlockingError(null); navigation.navigate('PreRegister'); }}
      />
    </View>
  );
};

export default PreRegisterPasswordScreen;
