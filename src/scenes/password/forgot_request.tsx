import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
  route?: {
    params?: {
      identifierType?: IdentifierType;
      identifierValue?: string;
    };
  };
}

type IdentifierType = 'dni' | 'email';

export default function ForgotPasswordRequestScreen({navigation, route}: Props) {
  const styles = useMemo(() => createPasswordScreenStyles(), []);
  const [identifierType, setIdentifierType] = useState<IdentifierType>(
    route?.params?.identifierType || 'dni',
  );
  const [identifierValue, setIdentifierValue] = useState(
    route?.params?.identifierValue || '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedValue = identifierValue.trim();
  const localValidationMessage = getIdentifierValidationMessage(
    identifierType,
    normalizedValue,
  );
  const canSubmit =
    !submitting && normalizedValue.length > 0 && !localValidationMessage;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload =
        identifierType === 'dni'
          ? {dni: normalizedValue}
          : {email: normalizedValue};

      const response: any = await authenticationRepository.forgotPassword(payload);

      Alert.alert(
        'Código enviado',
        response?.message || 'Revisá tu correo para continuar.',
        [
          {
            text: 'Continuar',
            onPress: () =>
              navigation.navigate('ForgotPasswordConfirm', {
                identifierType,
                identifierValue: normalizedValue,
                debugCode: response?.debug_code || '',
              }),
          },
        ],
      );
    } catch (error) {
      setErrorMessage(authenticationRepository.getErrorMessage(error));
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
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.description}>
          Elegí si querés recuperar tu cuenta con DNI o email. Si el usuario
          existe, el backend enviará un código OTP por correo.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, identifierType === 'dni' && styles.tabActive]}
            onPress={() => {
              setIdentifierType('dni');
              setIdentifierValue('');
              setErrorMessage('');
            }}
            disabled={submitting}>
            <Text
              style={[
                styles.tabText,
                identifierType === 'dni' && styles.tabTextActive,
              ]}>
              DNI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, identifierType === 'email' && styles.tabActive]}
            onPress={() => {
              setIdentifierType('email');
              setIdentifierValue('');
              setErrorMessage('');
            }}
            disabled={submitting}>
            <Text
              style={[
                styles.tabText,
                identifierType === 'email' && styles.tabTextActive,
              ]}>
              Email
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.label}>
            {identifierType === 'dni' ? 'DNI' : 'Email'}
          </Text>
          <TextInput
            style={styles.input}
            value={identifierValue}
            onChangeText={setIdentifierValue}
            editable={!submitting}
            autoCapitalize="none"
            keyboardType={identifierType === 'email' ? 'email-address' : 'numeric'}
            placeholder={
              identifierType === 'dni'
                ? 'Ingresá tu DNI'
                : 'Ingresá tu email'
            }
          />
        </View>

        {localValidationMessage ? (
          <Text style={styles.error}>{localValidationMessage}</Text>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <RoundedButton
          text={submitting ? 'Enviando...' : 'Solicitar código'}
          enabled={canSubmit}
          onPress={handleSubmit}
        />

        {submitting ? (
          <View style={styles.row}>
            <ActivityIndicator />
            <Text style={styles.description}>Enviando solicitud...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getIdentifierValidationMessage(
  identifierType: IdentifierType,
  value: string,
): string {
  if (!value) {
    return '';
  }

  if (identifierType === 'dni' && !/^\d+$/.test(value)) {
    return 'El DNI solo debe contener números.';
  }

  if (
    identifierType === 'email' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return 'Ingresá un email válido.';
  }

  return '';
}
