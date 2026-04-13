import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { departmentsRepository } from '../../repositories';
import Department from '../../models/Department';

type DepartmentFormRouteParams = {
  DepartmentForm: {
    department?: Department;
  };
};

const DepartmentForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DepartmentFormRouteParams, 'DepartmentForm'>>();
  const existing = route.params?.department;

  const [name, setName] = useState(existing?.name ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [schedule, setSchedule] = useState(existing?.schedule ?? '');
  const [contactInfo, setContactInfo] = useState(existing?.contactInfo ?? '');
  const [procedures, setProcedures] = useState(existing?.procedures ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del departamento es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const data = { name: name.trim(), location, schedule, contactInfo, procedures };
      if (existing) {
        await departmentsRepository.updateDepartment(existing.id, data);
        Alert.alert('Éxito', 'Departamento actualizado correctamente.');
      } else {
        await departmentsRepository.createDepartment(data);
        Alert.alert('Éxito', 'Departamento creado correctamente.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el departamento. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Field
          label="Nombre *"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Departamento de Computación"
        />
        <Field
          label="Ubicación"
          value={location}
          onChangeText={setLocation}
          placeholder="Ej: Pabellón I, Planta Baja"
        />
        <Field
          label="Horario de atención"
          value={schedule}
          onChangeText={setSchedule}
          placeholder="Ej: Lunes a Viernes de 10 a 17hs"
          multiline
          numberOfLines={3}
        />
        <Field
          label="Información de contacto"
          value={contactInfo}
          onChangeText={setContactInfo}
          placeholder="Ej: departamento@fi.uba.ar | (011) 5285-0000"
          multiline
          numberOfLines={3}
        />
        <Field
          label="Trámites"
          value={procedures}
          onChangeText={setProcedures}
          placeholder="Ej: Equivalencias, pedido de constancias..."
          multiline
          numberOfLines={4}
        />

        <RoundedButton
          text={saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear departamento'}
          enabled={!saving}
          onPress={handleSubmit}
          style={{}}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 10,
  },
});

export default DepartmentForm;
