import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RoundedButton, MaterialIcon} from '../../components';
import {secretariesRepository} from '../../repositories';
import Secretary from '../../models/Secretary';

type SecretaryFormRouteParams = {
  SecretaryForm: {
    secretary?: Secretary;
    parentId?: number;
  };
};

const SecretaryForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<SecretaryFormRouteParams, 'SecretaryForm'>>();
  const existing = route.params?.secretary;
  const paramParentId = route.params?.parentId ?? null;

  const [name, setName] = useState(existing?.name ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [schedule, setSchedule] = useState(existing?.schedule ?? '');
  const [contactInfo, setContactInfo] = useState(existing?.contactInfo ?? '');
  const [parentSecretary, setParentSecretary] = useState<number | null>(
    existing?.parentSecretary ?? paramParentId,
  );
  const [topLevelOptions, setTopLevelOptions] = useState<Secretary[]>([]);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    secretariesRepository
      .fetchAll()
      .then(data =>
        setTopLevelOptions(
          data.filter(s => s.parentSecretary === null && s.id !== existing?.id),
        ),
      )
      .catch(() => {});
  }, [existing?.id]);

  useEffect(() => {
    if (existing) {
      navigation.setOptions({
        title:
          existing.parentSecretary != null
            ? 'Editar Subsecretaría'
            : 'Editar Secretaría',
      });
    } else {
      navigation.setOptions({
        title:
          paramParentId != null ? 'Nueva Subsecretaría' : 'Nueva Secretaría',
      });
    }
  }, [navigation, existing, paramParentId]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la secretaría es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const data: Partial<Secretary> = {
        name: name.trim(),
        location,
        schedule,
        contactInfo,
        parentSecretary,
      };
      if (existing) {
        await secretariesRepository.updateSecretary(existing.id, data);
        Alert.alert('Éxito', 'Secretaría actualizada correctamente.');
      } else {
        await secretariesRepository.createSecretary(data);
        Alert.alert('Éxito', 'Secretaría creada correctamente.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo guardar la secretaría. Intente de nuevo.',
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedParentName =
    parentSecretary != null
      ? (topLevelOptions.find(s => s.id === parentSecretary)?.name ?? '...')
      : 'Secretaría principal (sin dependencia)';

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Field
          label="Nombre *"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Secretaría Académica"
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Secretaría a la que depende</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowParentPicker(prev => !prev)}
            activeOpacity={0.7}>
            <Text style={styles.pickerText} numberOfLines={1}>
              {selectedParentName}
            </Text>
            <MaterialIcon
              name={showParentPicker ? 'chevron-up' : 'chevron-down'}
              fontSize={18}
              color="#555"
            />
          </TouchableOpacity>
          {showParentPicker && (
            <View style={styles.pickerDropdown}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  parentSecretary === null && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setParentSecretary(null);
                  setShowParentPicker(false);
                }}>
                <Text
                  style={[
                    styles.pickerOptionText,
                    parentSecretary === null && styles.pickerOptionTextSelected,
                  ]}>
                  Secretaría principal (sin dependencia)
                </Text>
              </TouchableOpacity>
              {topLevelOptions.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pickerOption,
                    parentSecretary === s.id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setParentSecretary(s.id);
                    setShowParentPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      parentSecretary === s.id &&
                        styles.pickerOptionTextSelected,
                    ]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
          placeholder="Ej: secretaria@fi.uba.ar | (011) 5285-0000"
          multiline
          numberOfLines={3}
        />

        <RoundedButton
          text={
            saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear'
          }
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
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  pickerDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  pickerOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#1a56db',
    fontWeight: '600',
  },
});

export default SecretaryForm;
