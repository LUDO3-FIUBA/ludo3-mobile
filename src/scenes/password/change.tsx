import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {RoundedButton} from '../../components';
import {authenticationRepository} from '../../repositories';
import {createPasswordScreenStyles} from './shared';

interface Props {
  navigation: any;
}

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen({navigation}: Props) {
  const styles = useMemo(() => createPasswordScreenStyles(), []);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const localValidationMessage = getPasswordValidationMessage(
    newPassword,
    confirmPassword,
  );
  const canSubmit =
    !submitting &&
    !successMessage &&
    oldPassword.trim().length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length > 0 &&
    !localValidationMessage;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response: any = await authenticationRepository.changePassword(
        oldPassword,
        newPassword,
      );

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage(response?.message || 'Contraseña actualizada correctamente.');

      setTimeout(() => {
        navigation.goBack();
      }, 1400);
    } catch (error) {
      setErrorMessage(
        authenticationRepository.getErrorMessage(error, [
          'old_password',
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
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.description}>
          Ingresá tu contraseña actual y elegí una nueva clave para tu cuenta.
        </Text>

        <View>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            editable={!submitting}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Tu contraseña actual"
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
            placeholder="Confirmá la nueva contraseña"
          />
        </View>

        {localValidationMessage ? (
          <Text style={styles.error}>{localValidationMessage}</Text>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        <RoundedButton
          text={submitting ? 'Actualizando...' : 'Actualizar contraseña'}
          enabled={canSubmit}
          onPress={handleSubmit}
        />

        {submitting ? (
          <View style={styles.row}>
            <ActivityIndicator />
            <Text style={styles.description}>Guardando cambios...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getPasswordValidationMessage(
  newPassword: string,
  confirmPassword: string,
): string {
  if (newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH) {
    return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
    return 'La confirmación de contraseña no coincide.';
  }
  return '';
}
