import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { RoundedButton } from '../../components';
import { teacherProfileRepository } from '../../repositories';
import { TeacherProfile, WorkExperience } from '../../models/TeacherProfile';
import FormField from './FormField';

const EMPTY_WORK_EXPERIENCE: WorkExperience = {
  company: '',
  position: '',
  startYear: new Date().getFullYear(),
  endYear: undefined,
  description: '',
};

const EMPTY_PROFILE: TeacherProfile = {
  university: '',
  degree: '',
  bio: '',
  currentPosition: '',
  yearsOfExperience: undefined,
  certifications: '',
  workExperience: [],
};

const profileSchema = Yup.object().shape({
  university: Yup.string().required('La universidad es requerida'),
  degree: Yup.string().required('El título es requerido'),
  bio: Yup.string(),
  currentPosition: Yup.string().required('El cargo actual es requerido'),
  yearsOfExperience: Yup.number()
    .min(0, 'Debe ser mayor o igual a 0')
    .max(70, 'Debe ser menor o igual a 70')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  certifications: Yup.string(),
  workExperience: Yup.array().of(
    Yup.object().shape({
      company: Yup.string().required('La empresa es requerida'),
      position: Yup.string().required('El cargo es requerido'),
      startYear: Yup.number()
        .required('El año de inicio es requerido')
        .min(1950, 'Año inválido')
        .max(2100, 'Año inválido'),
      endYear: Yup.number()
        .min(1950, 'Año inválido')
        .max(2100, 'Año inválido')
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value)),
      description: Yup.string(),
    })
  ),
});

const TeacherProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const fetched = await teacherProfileRepository.fetchProfile();
      setProfile(fetched);
      setIsEditing(false);
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('404') || (error?.statusCode === 404)) {
        setIsEditing(true);
      } else {
        Alert.alert('Error', 'No se pudo cargar el perfil. Intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: TeacherProfile) => {
    setSaving(true);
    try {
      let saved: TeacherProfile;
      if (profile) {
        saved = await teacherProfileRepository.updateProfile(values);
      } else {
        saved = await teacherProfileRepository.createProfile(values);
      }
      setProfile(saved);
      setIsEditing(false);
      Alert.alert('Éxito', profile ? 'Perfil actualizado correctamente.' : 'Perfil creado correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil. Intente de nuevo.');
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

  if (!isEditing && profile) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Section title="Información académica">
          <Field label="Universidad" value={profile.university} />
          <Field label="Título / Carrera" value={profile.degree} />
          <Field label="Cargo actual" value={profile.currentPosition} />
          {profile.yearsOfExperience != null && (
            <Field label="Años de experiencia" value={String(profile.yearsOfExperience)} />
          )}
        </Section>

        {profile.bio ? (
          <Section title="Descripción personal">
            <Text style={styles.bioText}>{profile.bio}</Text>
          </Section>
        ) : null}

        {profile.certifications ? (
          <Section title="Certificaciones">
            <Text style={styles.bioText}>{profile.certifications}</Text>
          </Section>
        ) : null}

        {profile.workExperience.length > 0 && (
          <Section title="Experiencia laboral">
            {profile.workExperience.map((exp, idx) => (
              <View key={idx} style={styles.workItem}>
                <Text style={styles.workTitle}>{exp.position} — {exp.company}</Text>
                <Text style={styles.workYears}>
                  {exp.startYear}{exp.endYear ? ` – ${exp.endYear}` : ' – Presente'}
                </Text>
                {exp.description ? <Text style={styles.workDesc}>{exp.description}</Text> : null}
              </View>
            ))}
          </Section>
        )}

        <RoundedButton text="Editar perfil" onPress={() => setIsEditing(true)} style={{}} />
      </ScrollView>
    );
  }

  return (
    <Formik
      initialValues={profile ?? EMPTY_PROFILE}
      validationSchema={profileSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, setFieldValue }) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Información académica</Text>

          <FormField
            label="Universidad *"
            value={values.university}
            onChangeText={handleChange('university')}
            onBlur={handleBlur('university')}
            placeholder="Ej: UBA, UTN..."
            error={touched.university ? errors.university : undefined}
          />

          <FormField
            label="Título / Carrera *"
            value={values.degree}
            onChangeText={handleChange('degree')}
            onBlur={handleBlur('degree')}
            placeholder="Ej: Ingeniería en Sistemas"
            error={touched.degree ? errors.degree : undefined}
          />

          <FormField
            label="Cargo actual *"
            value={values.currentPosition}
            onChangeText={handleChange('currentPosition')}
            onBlur={handleBlur('currentPosition')}
            placeholder="Ej: JTP, Profesor Adjunto..."
            error={touched.currentPosition ? errors.currentPosition : undefined}
          />

          <FormField
            label="Años de experiencia"
            value={values.yearsOfExperience != null ? String(values.yearsOfExperience) : ''}
            onChangeText={text => setFieldValue('yearsOfExperience', text)}
            onBlur={handleBlur('yearsOfExperience')}
            placeholder="Ej: 10"
            keyboardType="numeric"
            error={touched.yearsOfExperience ? (errors.yearsOfExperience as string) : undefined}
          />

          <FormField
            label="Descripción personal"
            value={values.bio}
            onChangeText={handleChange('bio')}
            onBlur={handleBlur('bio')}
            placeholder="Contá algo sobre vos..."
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <FormField
            label="Certificaciones"
            value={values.certifications ?? ''}
            onChangeText={handleChange('certifications')}
            onBlur={handleBlur('certifications')}
            placeholder="Ej: AWS Certified, Scrum Master..."
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          <Text style={styles.sectionTitle}>Experiencia laboral</Text>

          <FieldArray name="workExperience">
            {({ push, remove }) => (
              <>
                {values.workExperience.map((_, idx) => {
                  const expErrors = (errors.workExperience?.[idx] as any) ?? {};
                  const expTouched = (touched.workExperience?.[idx] as any) ?? {};
                  return (
                    <View key={idx} style={styles.workCard}>
                      <View style={styles.workCardHeader}>
                        <Text style={styles.workCardTitle}>Experiencia {idx + 1}</Text>
                        <TouchableOpacity onPress={() => remove(idx)}>
                          <Text style={styles.removeText}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>

                      <FormField
                        label="Empresa *"
                        value={values.workExperience[idx].company}
                        onChangeText={handleChange(`workExperience[${idx}].company`)}
                        onBlur={handleBlur(`workExperience[${idx}].company`)}
                        placeholder="Ej: Mercado Libre"
                        error={expTouched.company ? expErrors.company : undefined}
                      />
                      <FormField
                        label="Cargo *"
                        value={values.workExperience[idx].position}
                        onChangeText={handleChange(`workExperience[${idx}].position`)}
                        onBlur={handleBlur(`workExperience[${idx}].position`)}
                        placeholder="Ej: Desarrollador Senior"
                        error={expTouched.position ? expErrors.position : undefined}
                      />
                      <FormField
                        label="Año de inicio *"
                        value={String(values.workExperience[idx].startYear)}
                        onChangeText={text => setFieldValue(`workExperience[${idx}].startYear`, text)}
                        onBlur={handleBlur(`workExperience[${idx}].startYear`)}
                        keyboardType="numeric"
                        placeholder="Ej: 2018"
                        error={expTouched.startYear ? expErrors.startYear : undefined}
                      />
                      <FormField
                        label="Año de fin (vacío si actual)"
                        value={values.workExperience[idx].endYear != null ? String(values.workExperience[idx].endYear) : ''}
                        onChangeText={text => setFieldValue(`workExperience[${idx}].endYear`, text === '' ? undefined : text)}
                        onBlur={handleBlur(`workExperience[${idx}].endYear`)}
                        keyboardType="numeric"
                        placeholder="Ej: 2022"
                        error={expTouched.endYear ? expErrors.endYear : undefined}
                      />
                      <FormField
                        label="Descripción"
                        value={values.workExperience[idx].description ?? ''}
                        onChangeText={handleChange(`workExperience[${idx}].description`)}
                        onBlur={handleBlur(`workExperience[${idx}].description`)}
                        placeholder="Descripción de tareas..."
                        multiline
                        numberOfLines={3}
                        style={styles.multilineInput}
                      />
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => push({ ...EMPTY_WORK_EXPERIENCE })}
                >
                  <Text style={styles.addButtonText}>+ Agregar experiencia</Text>
                </TouchableOpacity>
              </>
            )}
          </FieldArray>

          <RoundedButton
            text={saving ? 'Guardando...' : profile ? 'Guardar cambios' : 'Crear perfil'}
            enabled={!saving}
            onPress={() => formikSubmit()}
            style={{}}
          />

          {profile && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </Formik>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 8,
  },
  fieldRow: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111',
  },
  bioText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  workItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  workTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  workYears: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  workDesc: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
  },
  workCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  workCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  removeText: {
    color: '#e53e3e',
    fontSize: 14,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#4a90e2',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
  },
  cancelText: {
    color: '#666',
    fontSize: 15,
  },
  multilineInput: {
    height: undefined,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

export default TeacherProfileScreen;
