// src/scenes/google_register/index.tsx
import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView, Text, Alert, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';
import { authenticationRepository, usersRepository } from '../../repositories';
import SessionManager from '../../managers/sessionManager';

interface Props {
  navigation: any;
  route: {
    params: {
      googleData: {
        data: {
            sub: string;
            email: string;
            first_name: string;
            last_name: string;
        };
      };
    };
  };
}

const GoogleRegisterScreen: FunctionComponent<Props> = ({ navigation, route }) => {
  const { googleData } = route.params;
  const { sub, email, first_name, last_name } = googleData.data;

  const [dni, setDni] = useState('');
  const [padron, setPadron] = useState('');
  const [firstName, setFirstName] = useState(first_name || '');
  const [lastName, setLastName] = useState(last_name || '');
  const [dniValid, setDniValid] = useState(false);
  const [padronValid, setPadronValid] = useState(false);
  const [firstNameValid, setFirstNameValid] = useState(!!first_name);
  const [lastNameValid, setLastNameValid] = useState(!!last_name);
  const [registering, setRegistering] = useState(false);

  let dniTextInput = useRef<any>(null);
  let padronTextInput = useRef<any>(null);
  let firstNameTextInput = useRef<any>(null);
  let lastNameTextInput = useRef<any>(null);

  const shouldEnableRegister = () => 
    dniValid && padronValid && firstNameValid && lastNameValid && !registering;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await authenticationRepository.googleRegistration(
        sub,
        email,
        dni.trim(),
        padron.trim(),
        firstName.trim(),
        lastName.trim(),
        true, // is_student
        false, // is_teacher
      );

      const sessionManager: SessionManager = await SessionManager.getInstance()!;
      if (sessionManager) {
        await sessionManager.saveCredentials(response);
        const user = await usersRepository.getInfo();

        if (!user.isStudent()) {
          throw new authenticationRepository.NotAStudent();
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'RootDrawer' }],
        });
      }
    } catch (error) {
      if (error instanceof authenticationRepository.InvalidDNI) {
        Alert.alert('Error', 'El DNI ingresado ya está registrado o no es válido.');
      } else if (error instanceof authenticationRepository.NotAStudent) {
        Alert.alert('Error', 'No se pudo verificar tu condición de estudiante.');
      } else {
        Alert.alert('Error', 'No se pudo completar el registro. Por favor, intenta de nuevo.');
      }
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
          <View>
            <Text style={styles.headerText}>
              Completá tu registro
            </Text>
            <Text style={styles.subHeaderText}>
              Sólo necesitamos algunos datos más.
            </Text>

            <View style={style().inputLabels}>
              <Text style={style().text}>Correo electrónico</Text>
            </View>
            <FormInput
              style={[style().textInput, styles.disabledInput]}
              initialValue={email}
              editable={false}
            />

            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>Nombre</Text>
            </View>
            <FormInput
              ref={firstNameTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              returnKeyType="next"
              nextField={() => lastNameTextInput.current}
              placeholder="Por ejemplo: Juan"
              blurOnSubmit={false}
              initialValue={firstName}
              onTextChanged={(text, isValid) => {
                setFirstName(text);
                setFirstNameValid(isValid);
              }}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Nombre necesario.',
                },
              }}
            />

            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>Apellido</Text>
            </View>
            <FormInput
              ref={lastNameTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              returnKeyType="next"
              nextField={() => dniTextInput.current}
              placeholder="Por ejemplo: Pérez"
              blurOnSubmit={false}
              initialValue={lastName}
              onTextChanged={(text, isValid) => {
                setLastName(text);
                setLastNameValid(isValid);
              }}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Apellido necesario.',
                },
              }}
            />

            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>DNI</Text>
            </View>
            <FormInput
              ref={dniTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              returnKeyType="next"
              nextField={() => padronTextInput.current}
              placeholder="Por ejemplo: 12345678"
              blurOnSubmit={false}
              onTextChanged={(text, isValid) => {
                setDni(text);
                setDniValid(isValid);
              }}
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

            <View style={style().inputLabels}>
              <Text style={[style().text, { marginTop: 12 }]}>Padrón</Text>
            </View>
            <FormInput
              ref={padronTextInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              placeholder="Por ejemplo: 123456"
              onTextChanged={(text, isValid) => {
                setPadron(text);
                setPadronValid(isValid);
              }}
              validation={{
                presence: {
                  allowEmpty: false,
                  message: 'Padrón necesario.',
                },
                numericality: {
                  message: 'Padrón inválido',
                },
              }}
            />
          </View>
          <RoundedButton
            text={registering ? "Registrando..." : "Completar registro"}
            enabled={shouldEnableRegister()}
            style={{ MainContainer: { marginTop: 20 } }}
            onPress={handleRegister}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
});

export default GoogleRegisterScreen;