import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView, Text, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';
import { authenticationRepository } from '../../repositories';
// Comentado: import para captura de imagen
// import FacePictureConfiguration from './face_recognition';

interface Props {
  navigation: any;
  route: any;
}

const PreRegisterPasswordScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { dni, email, padron } = route.params;
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  let passwordInput = useRef<any>(null);

  const onPasswordChange = (text: string, isValid: boolean) => {
    setPassword(text);
    setPasswordValid(isValid);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authenticationRepository.preregister(dni, email, padron, password);
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
        console.error('[PreRegister] Error details:', JSON.stringify(error, null, 2));
        const errorMsg = error?.message || error?.toString() || 'Error desconocido';
        Alert.alert(
          'Error',
          `Hubo un error inesperado. Intenta nuevamente en unos minutos.\n\nDetalles: ${errorMsg}`,
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }
    } finally {
      setLoading(false);
    }
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
          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : (
            <RoundedButton
              text="Registrarme"
              enabled={passwordValid}
              style={style().button}
              onPress={handleSubmit}
            />
          )}
          {/* Comentado: navegación a captura de imagen
          <RoundedButton
            text="Siguiente"
            enabled={passwordValid}
            style={style().button}
            onPress={() => {
              navigation.navigate('TakePicture', {
                configuration: new FacePictureConfiguration(
                  ['Tomate una foto de frente'],
                  dni,
                  email,
                  padron,
                  password
                ).toObject(),
                title: 'Pre-registro',
              });
            }}
          />
          */}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterPasswordScreen;
