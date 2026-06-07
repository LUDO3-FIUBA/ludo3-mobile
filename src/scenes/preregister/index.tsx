import React, { useState, useRef, FunctionComponent } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { preregister as style } from '../../styles';
import { RoundedButton, FormInput } from '../../components';

interface Props {
  navigation: any;
}

type Role = 'student' | 'teacher';

const PreRegisterScreen: FunctionComponent<Props> = ({ navigation }) => {
  const [role, setRole] = useState<Role>('student');

  const [dni, setDni] = useState('');
  const [dniValid, setDniValid] = useState(false);

  // Student fields
  const [padron, setPadron] = useState('');
  const [padronValid, setPadronValid] = useState(false);

  // Teacher fields
  const [legajo, setLegajo] = useState('');
  const [legajoValid, setLegajoValid] = useState(false);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [firstNameValid, setFirstNameValid] = useState(false);
  const [lastName, setLastName] = useState('');
  const [lastNameValid, setLastNameValid] = useState(false);

  const dniInput = useRef<any>(null);
  const padronInput = useRef<any>(null);
  const legajoInput = useRef<any>(null);
  const emailInput = useRef<any>(null);
  const firstNameInput = useRef<any>(null);
  const lastNameInput = useRef<any>(null);

  const shouldEnableNext = () => {
    if (!dniValid) return false;
    if (role === 'student') return padronValid;
    return legajoValid && emailValid && firstNameValid && lastNameValid;
  };

  const onNext = () => {
    if (role === 'student') {
      navigation.navigate('PreRegisterPassword', { role, dni, padron });
    } else {
      navigation.navigate('PreRegisterPassword', {
        role,
        dni,
        legajo,
        email,
        firstName,
        lastName,
      });
    }
  };

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style().scrollView}
        >
          <View style={localStyles.toggleRow}>
            <TouchableOpacity
              style={[localStyles.toggleButton, role === 'student' && localStyles.toggleButtonActive]}
              onPress={() => setRole('student')}
            >
              <Text style={[localStyles.toggleText, role === 'student' && localStyles.toggleTextActive]}>
                Alumno
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.toggleButton, role === 'teacher' && localStyles.toggleButtonActive]}
              onPress={() => setRole('teacher')}
            >
              <Text style={[localStyles.toggleText, role === 'teacher' && localStyles.toggleTextActive]}>
                Docente
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <View style={style().inputLabels}>
              <Text style={style().text}>DNI</Text>
            </View>
            <FormInput
              ref={dniInput}
              style={style().textInput}
              placeholderColor={style().textInputPlaceholder.color}
              errorStyle={style().errorInInput}
              keyboardType="numeric"
              returnKeyType="next"
              nextField={() => (role === 'student' ? padronInput.current : legajoInput.current)}
              placeholder="Por ejemplo: 12345678"
              blurOnSubmit={false}
              onTextChanged={(text, isValid) => {
                setDni(text);
                setDniValid(isValid);
              }}
              validation={{
                presence: { allowEmpty: false, message: 'DNI necesario.' },
                length: { is: 8, message: 'DNI inválido (debe tener 8 dígitos)' },
              }}
            />

            {role === 'student' && (
              <>
                <View style={style().inputLabels}>
                  <Text style={[style().text, { marginTop: 12 }]}>Padrón</Text>
                </View>
                <FormInput
                  ref={padronInput}
                  style={style().textInput}
                  placeholderColor={style().textInputPlaceholder.color}
                  errorStyle={style().errorInInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholder="Por ejemplo: 123456"
                  onTextChanged={(text, isValid) => {
                    setPadron(text);
                    setPadronValid(isValid);
                  }}
                  validation={{
                    presence: { allowEmpty: false, message: 'Padrón necesario.' },
                    length: { maximum: 7, tooLong: 'Padrón inválido (máximo 7 dígitos)' },
                    format: { pattern: /^\d+$/, message: 'El padrón debe ser numérico' },
                  }}
                />
              </>
            )}

            {role === 'teacher' && (
              <>
                <View style={style().inputLabels}>
                  <Text style={[style().text, { marginTop: 12 }]}>Legajo</Text>
                </View>
                <FormInput
                  ref={legajoInput}
                  style={style().textInput}
                  placeholderColor={style().textInputPlaceholder.color}
                  errorStyle={style().errorInInput}
                  returnKeyType="next"
                  nextField={() => emailInput.current}
                  placeholder="Por ejemplo: 12345"
                  blurOnSubmit={false}
                  onTextChanged={(text, isValid) => {
                    setLegajo(text);
                    setLegajoValid(isValid);
                  }}
                  validation={{
                    presence: { allowEmpty: false, message: 'Legajo necesario.' },
                    length: { minimum: 5, maximum: 8, tooShort: 'Mínimo 5 caracteres', tooLong: 'Máximo 8 caracteres' },
                  }}
                />

                <View style={style().inputLabels}>
                  <Text style={[style().text, { marginTop: 12 }]}>Email</Text>
                </View>
                <FormInput
                  ref={emailInput}
                  style={style().textInput}
                  placeholderColor={style().textInputPlaceholder.color}
                  errorStyle={style().errorInInput}
                  keyboardType="email-address"
                  returnKeyType="next"
                  nextField={() => firstNameInput.current}
                  placeholder="Por ejemplo: docente@fi.uba.ar"
                  blurOnSubmit={false}
                  onTextChanged={(text, isValid) => {
                    setEmail(text);
                    setEmailValid(isValid);
                  }}
                  validation={{
                    presence: { allowEmpty: false, message: 'Email necesario.' },
                    email: { message: 'Email inválido' },
                  }}
                />

                <View style={style().inputLabels}>
                  <Text style={[style().text, { marginTop: 12 }]}>Nombre</Text>
                </View>
                <FormInput
                  ref={firstNameInput}
                  style={style().textInput}
                  placeholderColor={style().textInputPlaceholder.color}
                  errorStyle={style().errorInInput}
                  returnKeyType="next"
                  nextField={() => lastNameInput.current}
                  placeholder="Por ejemplo: Juan"
                  blurOnSubmit={false}
                  onTextChanged={(text, isValid) => {
                    setFirstName(text);
                    setFirstNameValid(isValid);
                  }}
                  validation={{
                    presence: { allowEmpty: false, message: 'Nombre necesario.' },
                  }}
                />

                <View style={style().inputLabels}>
                  <Text style={[style().text, { marginTop: 12 }]}>Apellido</Text>
                </View>
                <FormInput
                  ref={lastNameInput}
                  style={style().textInput}
                  placeholderColor={style().textInputPlaceholder.color}
                  errorStyle={style().errorInInput}
                  returnKeyType="done"
                  placeholder="Por ejemplo: Pérez"
                  onTextChanged={(text, isValid) => {
                    setLastName(text);
                    setLastNameValid(isValid);
                  }}
                  validation={{
                    presence: { allowEmpty: false, message: 'Apellido necesario.' },
                  }}
                />
              </>
            )}
          </View>

          <RoundedButton
            text="Siguiente"
            enabled={shouldEnableNext()}
            style={style().button}
            onPress={onNext}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0066a2',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#0066a2',
  },
  toggleText: {
    color: '#0066a2',
    fontWeight: '600',
    fontSize: 15,
  },
  toggleTextActive: {
    color: 'white',
  },
});

export default PreRegisterScreen;
