import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RoundedButton } from '../../components';
import { usersRepository } from '../../repositories';
import FormField from '../teacher_profile/FormField';

const profileSchema = Yup.object().shape({
  linkedinUrl: Yup.string()
    .url('Debe ser una URL válida (ej: https://linkedin.com/in/tu-perfil)')
    .nullable()
    .transform(v => (v === '' ? null : v)),
  githubUrl: Yup.string()
    .url('Debe ser una URL válida (ej: https://github.com/tu-usuario)')
    .nullable()
    .transform(v => (v === '' ? null : v)),
});

const ProfileScreen: React.FC = () => {
  const [initialValues, setInitialValues] = useState({ linkedinUrl: '', githubUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    usersRepository
      .getInfo()
      .then(user =>
        setInitialValues({
          linkedinUrl: user.linkedinUrl ?? '',
          githubUrl: user.githubUrl ?? '',
        }),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (values: { linkedinUrl: string; githubUrl: string }) => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const linkedinUrl = values.linkedinUrl ?? '';
      const githubUrl = values.githubUrl ?? '';

      const ops: Promise<void>[] = [];
      if (linkedinUrl !== initialValues.linkedinUrl) {
        ops.push(usersRepository.updateLinkedinUrl(linkedinUrl));
      }
      if (githubUrl !== initialValues.githubUrl) {
        ops.push(usersRepository.updateGithubUrl(githubUrl));
      }
      await Promise.all(ops);

      setInitialValues({ linkedinUrl, githubUrl });
      setSuccessMessage('Perfil actualizado correctamente.');
    } catch (error: any) {
      const backendError =
        error?.info?.linkedin_url?.[0] ?? error?.info?.github_url?.[0] ?? error?.message;
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

  const webWidthStyle = Platform.OS === 'web'
    ? { width: '60%' as any, maxWidth: 480, alignSelf: 'center' as const }
    : {};

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={profileSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit }) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={webWidthStyle}>
          <Text style={styles.description}>
            Asociá tus perfiles profesionales (opcional). Otros miembros de la plataforma podrán verlos.
          </Text>

          <Text style={styles.sectionTitle}>LinkedIn</Text>
          <FormField
            label="URL de LinkedIn"
            value={values.linkedinUrl}
            onChangeText={handleChange('linkedinUrl')}
            onBlur={handleBlur('linkedinUrl')}
            placeholder="https://linkedin.com/in/tu-perfil"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            error={touched.linkedinUrl ? errors.linkedinUrl : undefined}
          />
          {values.linkedinUrl && !errors.linkedinUrl ? (
            <TouchableOpacity
              style={styles.previewLink}
              onPress={() => Linking.openURL(values.linkedinUrl)}
            >
              <Text style={[styles.previewLinkText, { color: '#0a66c2' }]}>Abrir en LinkedIn</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.sectionTitle}>GitHub</Text>
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
              <Text style={[styles.previewLinkText, { color: '#0d1117' }]}>Abrir en GitHub</Text>
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
          </View>
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
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  previewLink: {
    marginBottom: 16,
  },
  previewLinkText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 12,
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
    marginTop: 12,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
