import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';
import FacePictureConfiguration from './face_recognition';

interface Props {
  navigation: any;
  route: any;
}

const PreRegisterPasswordScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { dni, email, padron } = route.params;
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState<boolean>(false);

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
        email,
        padron,
        password
      ).toObject(),
      title: 'Pre-registro',
    });
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
            text="Siguiente"
            enabled={passwordValid}
            style={style().button}
            onPress={goToFaceCapture}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterPasswordScreen;
