import React, { useState, useRef, FunctionComponent } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';
import { authenticationRepository } from '../../repositories';
import FacePictureConfiguration from './face_recognition';

interface Props {
  navigation: any;
  route: any;
}

const PreRegisterPasswordScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { dni, padron } = route.params;
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);

  let passwordInput = useRef<any>(null);

  const onPasswordChange = (text: string, isValid: boolean) => {
    setPassword(text);
    setPasswordValid(isValid);
  };

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

  const registerWithoutFace = async () => {
    setRegistering(true);
    try {
      await authenticationRepository.preregister(dni, padron, password);
      navigation.navigate('PreRegisterDone');
    } catch (error: any) {
      if (error instanceof authenticationRepository.InvalidDNI) {
        Alert.alert(
          'DNI ya registrado',
          'Chequeá haberlo ingresado correctamente. De ser correcto, ' +
          'contactate con Admisión para resetear la cuenta asociada a este DNI.',
          [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
          { cancelable: false }
        );
      } else {
        const errorMsg = error?.message || error?.toString() || 'Error desconocido';
        Alert.alert(
          'Error',
          `Hubo un error inesperado. Intenta nuevamente en unos minutos.\n\nDetalles: ${errorMsg}`,
          [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
          { cancelable: false }
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  const promptSkipFace = () => {
    Alert.alert(
      '¿Continuar sin foto?',
      'Vas a poder registrarte, pero tendrás que completar el registro facial ' +
      'desde tu perfil antes de poder dar presente en clases o finales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar sin foto', onPress: registerWithoutFace },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style().scrollView}
        >
          <View>
            <View style={style().inputLabels}>
              <Text style={style().text}>
                Contraseña
              </Text>
            </View>
            <Text style={[style().text, { fontSize: 14, marginBottom: 12, opacity: 0.8 }]}>
              Ingresá la misma contraseña que usás en el SIU Guaraní
            </Text>
            <FormInput
              ref={passwordInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              secure={true}
              returnKeyType="done"
              placeholder="Contraseña del SIU Guaraní"
              onTextChanged={(text, isValid) => onPasswordChange(text, isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Contraseña necesaria.',
                },
                length: {
                  minimum: 1,
                  message: 'Contraseña necesaria.',
                },
              }}
            />
          </View>
          <RoundedButton
            text={registering ? 'Registrando...' : 'Siguiente'}
            enabled={passwordValid && !registering}
            style={style().button}
            onPress={goToFaceCapture}
          />
          <TouchableOpacity
            disabled={!passwordValid || registering}
            onPress={promptSkipFace}
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
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterPasswordScreen;
