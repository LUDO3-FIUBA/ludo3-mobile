import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RoundedButton } from '../../components';
import { usersRepository } from '../../repositories';
import FormField from '../teacher_profile/FormField';

const githubSchema = Yup.object().shape({
  githubUrl: Yup.string()
    .url('Debe ser una URL válida (ej: https://github.com/tu-usuario)')
    .nullable()
    .transform(v => (v === '' ? null : v)),
});

const MyAccountScreen: React.FC = () => {
  const [initialGithubUrl, setInitialGithubUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    usersRepository
      .getInfo()
      .then(user => setInitialGithubUrl(user.githubUrl ?? ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (values: { githubUrl: string }) => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await usersRepository.updateGithubUrl(values.githubUrl ?? '');
      setInitialGithubUrl(values.githubUrl ?? '');
      setSuccessMessage('GitHub actualizado correctamente.');
    } catch (error: any) {
      const backendError = error?.info?.github_url?.[0] ?? error?.message;
      setErrorMessage(backendError ?? 'No se pudo guardar. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Formik
      initialValues={{ githubUrl: initialGithubUrl }}
      validationSchema={githubSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit }) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Vínculo de GitHub</Text>
          <Text style={styles.description}>
            Asociá tu perfil de GitHub. Este dato es visible para docentes y otros miembros de la plataforma.
          </Text>

          <FormField
            label="URL de GitHub"
            value={values.githubUrl}
            onChangeText={handleChange('githubUrl')}
            onBlur={handleBlur('githubUrl')}
            placeholder="https://github.com/tu-usuario"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            error={touched.githubUrl ? errors.githubUrl : undefined}
          />

          {values.githubUrl && !errors.githubUrl ? (
            <TouchableOpacity
              style={styles.previewLink}
              onPress={() => Linking.openURL(values.githubUrl)}
            >
              <Text style={styles.previewLinkText}>Abrir en GitHub</Text>
            </TouchableOpacity>
          ) : null}

          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <RoundedButton
            text={saving ? 'Guardando...' : 'Guardar'}
            enabled={!saving}
            onPress={() => formikSubmit()}
            style={{}}
          />
        </ScrollView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    lineHeight: 20,
  },
  previewLink: {
    marginBottom: 16,
  },
  previewLinkText: {
    color: '#0d1117',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MyAccountScreen;
