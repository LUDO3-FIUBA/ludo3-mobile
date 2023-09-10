import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';
import FacePictureConfiguration from './face_recognition';

interface Props {
  navigation: any; // You can specify the exact type based on your navigation setup
}

const PreRegisterScreen: FunctionComponent<Props> = ({ navigation }) => {
  const [firstValid, setFirstValid] = useState<boolean>(false);
  const [secondValid, setSecondValid] = useState<boolean>(false);

  let firstTextInput = useRef<any>(null); // Specify the exact type based on FormInput implementation
  let secondTextInput = useRef<any>(null); // Specify the exact type based on FormInput implementation

  const shouldEnableSignUp = () => firstValid && secondValid;

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style().scrollView}
        >
          <View>
            <FormInput
              ref={firstTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              returnKeyType="next"
              nextField={() => secondTextInput.current}
              placeholder="DNI"
              blurOnSubmit={false}
              onTextChanged={(text, isValid) => setFirstValid(isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'DNI necesario.',
                },
                length: {
                  is: 8,
                  message: 'DNI inválido',
                },
              }}
            />
            <FormInput
              ref={secondTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="email-address"
              placeholder="Email"
              onTextChanged={(text, isValid) => setSecondValid(isValid)}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Email necesario.',
                },
                email: {
                  message: 'Email inválido.',
                },
              }}
            />
          </View>
          <RoundedButton
            text="LISTO"
            enabled={shouldEnableSignUp()}
            style={style().button}
            onPress={() => {
              const dni = firstTextInput.current?.state.value;
              const email = secondTextInput.current?.state.value;
              navigation.navigate('TakePicture', {
                configuration: new FacePictureConfiguration(
                  ['Tomate una foto de frente'],
                  dni,
                  email
                ).toObject(),
                title: 'Pre-registro',
              });
            }}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PreRegisterScreen;
