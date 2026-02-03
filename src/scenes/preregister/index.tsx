import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';

interface Props {
  navigation: any;
}

const PreRegisterScreen: FunctionComponent<Props> = ({ navigation }) => {
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [padron, setPadron] = useState("");
  const [dniValid, setDniValid] = useState<boolean>(false);
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [padronValid, setPadronValid] = useState<boolean>(false);

  let dniInput = useRef<any>(null);
  let emailInput = useRef<any>(null);
  let padronInput = useRef<any>(null);

  const shouldEnableNext = () => dniValid && emailValid && padronValid;

  const onDniChange = (text: string, isValid: boolean) => {
    setDni(text);
    setDniValid(isValid);
  };

  const onEmailChange = (text: string, isValid: boolean) => {
    setEmail(text);
    setEmailValid(isValid);
  };

  const onPadronChange = (text: string, isValid: boolean) => {
    setPadron(text);
    setPadronValid(isValid);
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
                DNI
              </Text>
            </View>
            <FormInput
              ref={dniInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              returnKeyType="next"
              nextField={() => emailInput.current}
              placeholder="Por ejemplo: 12345678"
              blurOnSubmit={false}
              onTextChanged={(text, isValid) => onDniChange(text, isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'DNI necesario.',
                },
                length: {
                  is: 8,
                  message: 'DNI inválido (debe tener 8 dígitos)',
                },
              }}
            />
            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>
                Correo electrónico
              </Text>
            </View>
            <FormInput
              ref={emailInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="email-address"
              returnKeyType="next"
              nextField={() => padronInput.current}
              placeholder="Por ejemplo: nombre@fi.uba.ar"
              blurOnSubmit={false}
              onTextChanged={(text, isValid) => onEmailChange(text, isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Email necesario.',
                },
                format: {
                  pattern: "^[a-zA-Z0-9._%+-]+@fi\\.uba\\.ar$",
                  flags: "i",
                  message: 'El email debe ser @fi.uba.ar',
                },
              }}
            />
            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>
                Padrón
              </Text>
            </View>
            <FormInput
              ref={padronInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              returnKeyType="done"
              placeholder="Por ejemplo: 123456"
              onTextChanged={(text, isValid) => onPadronChange(text, isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Padrón necesario.',
                },
                length: {
                  maximum: 7,
                  tooLong: 'Padrón inválido (máximo 7 dígitos)',
                },
                format: {
                  pattern: /^\d+$/,
                  message: 'El padrón debe ser numérico',
                },
              }}
            />
          </View>
          <RoundedButton
            text="Siguiente"
            enabled={shouldEnableNext()}
            style={style().button}
            onPress={() => {
              navigation.navigate('PreRegisterPassword', {
                dni,
                email,
                padron,
              });
            }}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterScreen;