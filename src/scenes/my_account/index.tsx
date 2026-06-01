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
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AlertDialog, RoundedButton, UserAvatar } from '../../components';
import User from '../../models/User';
import { useAppDispatch } from '../../redux/hooks';
import { setProfilePhoto } from '../../redux/reducers/currentUserSlice';
import { usersRepository, careersRepository } from '../../repositories';
import FormField from '../teacher_profile/FormField';
import { Career } from '../../models/Career';

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
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [initialValues, setInitialValues] = useState({ linkedinUrl: '', githubUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [careersLoading, setCareersLoading] = useState(true);

  useEffect(() => {
    usersRepository
      .getInfo()
      .then(fetchedUser => {
        setUser(fetchedUser);
        dispatch(setProfilePhoto(fetchedUser.profilePhoto));
        setInitialValues({
          linkedinUrl: fetchedUser.linkedinUrl ?? '',
          githubUrl: fetchedUser.githubUrl ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dispatch]);

  const pickAndUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage('Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    setUploadingPhoto(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const updated = await usersRepository.uploadProfilePhoto({
        uri: asset.uri,
        type: asset.mimeType ?? `image/${ext}`,
        name: asset.fileName ?? `profile.${ext}`,
      });
      setUser(updated);
      dispatch(setProfilePhoto(updated.profilePhoto));
      setSuccessMessage('Foto de perfil actualizada.');
    } catch {
      setErrorMessage('No se pudo subir la foto. Intente de nuevo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await usersRepository.removeProfilePhoto();
      setUser(prev => prev ? new User(
        prev.dni, prev.firstName, prev.lastName, prev.email,
        prev.studentId, prev.isTeacherFlag, prev.isStaffFlag,
        prev.faceRegistered, prev.githubUrl, prev.isSuperuserFlag,
        prev.departmentId, prev.linkedinUrl, prev.isBedeliaFlag, null,
      ) : null);
      dispatch(setProfilePhoto(null));
      setSuccessMessage('Foto de perfil eliminada.');
    } catch {
      setErrorMessage('No se pudo eliminar la foto. Intente de nuevo.');
    } finally {
      setRemovingPhoto(false);
      setConfirmRemoveVisible(false);
    }
  };

  useEffect(() => {
    careersRepository
      .getCareers()
      .then(setCareers)
      .catch(() => {})
      .finally(() => setCareersLoading(false));
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
    <>
    <Formik
      initialValues={initialValues}
      validationSchema={profileSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit }) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={webWidthStyle}>
          <Text style={styles.sectionTitle}>Carreras</Text>
          {careersLoading ? (
            <ActivityIndicator size="small" style={{ marginBottom: 16 }} />
          ) : careers.length === 0 ? (
            <Text style={styles.description}>No se encontraron carreras asociadas.</Text>
          ) : (
            careers.map(career => (
              <View key={career.id} style={styles.careerCard}>
                <Text style={styles.careerName}>{career.name}</Text>
                {career.plan ? (
                  <Text style={styles.careerDetail}>Plan: {career.plan}</Text>
                ) : null}
                {career.enrollment_date ? (
                  <Text style={styles.careerDetail}>Ingreso: {career.enrollment_date}</Text>
                ) : null}
                {career.graduation_date ? (
                  <Text style={styles.careerDetail}>Egreso: {career.graduation_date}</Text>
                ) : null}
              </View>
            ))
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Redes sociales</Text>
          <Text style={styles.description}>
            Asociá tus perfiles profesionales (opcional). Otros miembros de la plataforma podrán verlos.
          </Text>

          <Text style={styles.subsectionTitle}>LinkedIn</Text>
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

          <Text style={styles.subsectionTitle}>GitHub</Text>
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

            {/* Profile photo */}
            <Text style={styles.sectionTitle}>Foto de perfil</Text>
            <View style={styles.photoSection}>
              <TouchableOpacity onPress={pickAndUploadPhoto} disabled={uploadingPhoto || removingPhoto} style={styles.photoContainer}>
                <UserAvatar photoUrl={user?.profilePhoto} size={100} />
                <View style={styles.cameraOverlay}>
                  {uploadingPhoto
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Icon name="camera" size={18} color="#fff" />}
                </View>
              </TouchableOpacity>
              <Text style={styles.photoHint}>Tocá para cambiar tu foto</Text>
              {user?.profilePhoto ? (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setConfirmRemoveVisible(true)}
                  disabled={uploadingPhoto || removingPhoto}
                >
                  <Icon name="delete-outline" size={14} color="#b42318" />
                  <Text style={styles.removePhotoText}>Eliminar foto</Text>
                </TouchableOpacity>
              ) : null}
            </View>

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
    <AlertDialog
      visible={confirmRemoveVisible}
      title="Eliminar foto de perfil"
      message="¿Estás seguro de que querés eliminar tu foto de perfil? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      destructive
      loading={removingPhoto}
      onConfirm={handleRemovePhoto}
      onCancel={() => setConfirmRemoveVisible(false)}
    />
    </>
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#003f8a',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  photoHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    padding: 4,
  },
  removePhotoText: {
    fontSize: 12,
    color: '#b42318',
    fontWeight: '600',
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
  careerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007aff',
  },
  careerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  careerDetail: {
    fontSize: 13,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#dcdcdc',
    marginVertical: 20,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
});

export default ProfileScreen;
