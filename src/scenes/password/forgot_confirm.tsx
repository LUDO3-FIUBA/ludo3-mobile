import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RoundedButton} from '../../components';
import {authenticationRepository} from '../../repositories';
import {createPasswordScreenStyles} from './shared';

interface Props {
  navigation: any;
  route: {
    params?: {
      identifierType?: 'dni' | 'email';
      identifierValue?: string;
      debugCode?: string;
    };
  };
}

const MIN_PASSWORD_LENGTH = 8;

export default function ForgotPasswordConfirmScreen({
  navigation,
  route,
}: Props) {
  const styles = useMemo(() => createPasswordScreenStyles(), []);
  const identifierType = route.params?.identifierType || 'dni';
  const identifierValue = route.params?.identifierValue || '';
  const [code, setCode] = useState(route.params?.debugCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const debugMessage = route.params?.debugCode
    ? 'Se precargó el código OTP devuelto por el backend para pruebas locales.'
    : '';

  const localValidationMessage = getPasswordValidationMessage(
    code,
    newPassword,
    confirmPassword,
  );
  const canSubmitForm =
    !submitting &&
    !successMessage &&
    identifierValue.trim().length > 0 &&
    code.trim().length === 6 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length > 0 &&
    !localValidationMessage;

  async function handleSubmit() {
    if (!canSubmitForm) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const response: any = await authenticationRepository.resetPasswordConfirm({
        [identifierType]: identifierValue.trim(),
        code: code.trim(),
        new_password: newPassword,
      });

      setSuccessMessage(response?.message || 'Contraseña restablecida correctamente.');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Landing'}],
        });
      }, 1400);
    } catch (error) {
      setErrorMessage(
        authenticationRepository.getErrorMessage(error, [
          'code',
          'new_password',
        ]),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Confirmar recuperación</Text>
        <Text style={styles.description}>
          Ingresá el código OTP recibido por correo y definí tu nueva
          contraseña.
        </Text>
        <Text style={styles.hint}>
          {identifierType === 'dni' ? 'DNI' : 'Email'}: {identifierValue}
        </Text>

        <View>
          <Text style={styles.label}>Código OTP</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={text => {
              setCode(text.replace(/[^\d]/g, '').slice(0, 6));
              setErrorMessage('');
            }}
            editable={!submitting}
            keyboardType="numeric"
            placeholder="123456"
          />
        </View>

        <View>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!submitting}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Nueva contraseña"
          />
          <Text style={styles.hint}>
            Usá al menos {MIN_PASSWORD_LENGTH} caracteres.
          </Text>
        </View>

        <View>
          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!submitting}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Repetí la nueva contraseña"
          />
        </View>

        {debugMessage ? <Text style={styles.success}>{debugMessage}</Text> : null}
        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}
        {localValidationMessage ? (
          <Text style={styles.error}>{localValidationMessage}</Text>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <RoundedButton
          text={submitting ? 'Restableciendo...' : 'Restablecer contraseña'}
          enabled={canSubmitForm}
          onPress={handleSubmit}
        />

        <TouchableOpacity
          disabled={submitting}
          onPress={() =>
            navigation.navigate('ForgotPasswordRequest', {
              identifierType,
              identifierValue,
            })
          }>
          <Text style={styles.link}>Solicitar un código nuevo</Text>
        </TouchableOpacity>

        {submitting ? (
          <View style={styles.row}>
            <ActivityIndicator />
            <Text style={styles.description}>Validando código...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getPasswordValidationMessage(
  code: string,
  newPassword: string,
  confirmPassword: string,
): string {
  if (code.length > 0 && code.length !== 6) {
    return 'El código debe tener 6 dígitos.';
  }
  if (newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH) {
    return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
    return 'La confirmación de contraseña no coincide.';
  }
  return '';
}
