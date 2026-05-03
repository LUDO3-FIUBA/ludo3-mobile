import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { RoundedButton, MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import { LocalFile } from '../../repositories/forms';
import FormDetail, { FormField } from '../../models/FormDetail';
import { TeacherModelSnakeCase } from '../../models/Teachers';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  formId: number;
}

type AnswerMap = Record<number, string | null>;

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
};

// ── Teacher search component ──────────────────────────────────────────────────

interface TeacherSearchProps {
  selected: TeacherModelSnakeCase | null;
  onSelect: (teacher: TeacherModelSnakeCase | null) => void;
  error?: string | null;
}

const TeacherSearch: React.FC<TeacherSearchProps> = ({ selected, onSelect, error }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TeacherModelSnakeCase[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await formsRepository.searchTeachers(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (selected) {
    return (
      <View style={tsStyles.selectedChip}>
        <MaterialIcon name="account-check" fontSize={18} color="#1B5E20" />
        <Text style={tsStyles.selectedName}>
          {selected.first_name} {selected.last_name}
        </Text>
        <TouchableOpacity onPress={() => onSelect(null)} hitSlop={8}>
          <MaterialIcon name="close-circle" fontSize={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={[tsStyles.inputRow, error ? tsStyles.inputRowError : null]}>
        <MaterialIcon name="magnify" fontSize={18} color="#888" />
        <TextInput
          style={tsStyles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar docente por nombre o legajo..."
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />
        {searching && <ActivityIndicator size="small" color={lightModeColors.institutional} />}
      </View>
      {error ? <Text style={tsStyles.errorText}>{error}</Text> : null}
      {results.length > 0 && (
        <View style={tsStyles.dropdown}>
          {results.map(t => (
            <TouchableOpacity
              key={t.id}
              style={tsStyles.dropdownItem}
              onPress={() => {
                onSelect(t);
                setQuery('');
                setResults([]);
              }}
            >
              <Text style={tsStyles.dropdownName}>{t.first_name} {t.last_name}</Text>
              {t.legajo ? <Text style={tsStyles.dropdownLegajo}>Legajo: {t.legajo}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {query.trim().length >= 2 && !searching && results.length === 0 && (
        <Text style={tsStyles.noResults}>Sin resultados para "{query}"</Text>
      )}
    </View>
  );
};

const tsStyles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#fafafa',
  },
  inputRowError: { borderColor: '#C62828', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 14, color: '#111' },
  errorText: { color: '#C62828', fontSize: 12, marginTop: 4, fontWeight: '600' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#222' },
  dropdownLegajo: { fontSize: 12, color: '#888', marginTop: 2 },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1B5E20' },
  noResults: { fontSize: 13, color: '#aaa', fontStyle: 'italic', marginTop: 6 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

const DigitalFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { formId } = route.params as RouteParams;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fileAnswers, setFileAnswers] = useState<Record<number, LocalFile | null>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherModelSnakeCase | null>(null);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  useEffect(() => {
    formsRepository
      .fetchFormDetail(formId)
      .then(detail => {
        setForm(detail);
        const initial: AnswerMap = {};
        detail.fields.forEach(f => (initial[f.form_field_id] = null));
        setAnswers(initial);
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el formulario.'))
      .finally(() => setLoading(false));
  }, []);

  const setAnswer = (fieldId: number, value: string | null) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    setFieldErrors(prev => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const setFileAnswer = (fieldId: number, file: LocalFile | null) => {
    setFileAnswers(prev => ({ ...prev, [fieldId]: file }));
    setFieldErrors(prev => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const validateField = (field: FormField, value: string | null): string | null => {
    if (field.form_field_require && (value === null || value === '')) {
      return 'Este campo es obligatorio.';
    }

    if (value === null || value === '') return null;

    if (field.form_field_type.value === 'mail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Ingresá un email válido.';
    }

    if (field.form_field_type.value === 'numero') {
      if (!/^\d+$/.test(value)) return 'Ingresá un número válido.';
    }

    if (field.form_field_type.value === 'padron') {
      if (!/^\d{5,6}$/.test(value)) return 'Ingresá un padrón válido (5 o 6 dígitos).';
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!form || submitting) return;

    const nextErrors: Record<number, string> = {};
    form.fields.forEach(field => {
      if (field.form_field_type.value === 'adjunto') {
        if (field.form_field_require && !fileAnswers[field.form_field_id]) {
          nextErrors[field.form_field_id] = 'Este campo es obligatorio.';
        }
      } else {
        const error = validateField(field, answers[field.form_field_id] ?? null);
        if (error) nextErrors[field.form_field_id] = error;
      }
    });
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (form.requires_teacher_validation && !selectedTeacher) {
      setTeacherError('Debés seleccionar un docente validador para enviar este formulario.');
      return;
    }
    setTeacherError(null);

    const adjuntoField = form.fields.find(f => f.form_field_type.value === 'adjunto');
    const adjuntoFile = adjuntoField ? fileAnswers[adjuntoField.form_field_id] ?? null : null;
    const nonAdjuntoAnswers = form.fields
      .filter(f => f.form_field_type.value !== 'adjunto')
      .map(f => ({ field_id: f.form_field_id, answer_value: answers[f.form_field_id] ?? null }));

    setSubmitting(true);
    setSubmitStatus(null);
    try {
      if (adjuntoField && adjuntoFile) {
        await formsRepository.submitDigitalFormWithAdjunto(
          formId,
          nonAdjuntoAnswers,
          adjuntoFile,
          selectedTeacher?.id,
        );
      } else {
        await formsRepository.submitDigitalForm(formId, nonAdjuntoAnswers, selectedTeacher?.id);
      }
      setSubmitStatus({ type: 'success', message: 'Formulario enviado correctamente.' });
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'No se pudo enviar el formulario. Por favor intentá nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Formulario no disponible.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>{form.form_name}</Text>
        {!!form.form_description && <Text style={styles.description}>{form.form_description}</Text>}
        {!!form.form_information && (
          <View style={styles.infoBox}>
            <MaterialIcon name="information" fontSize={18} color="#1976D2" />
            <Text style={styles.infoText}>{form.form_information}</Text>
          </View>
        )}

        {form.fields.map(field => (
          <View key={field.form_field_id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.form_field_label}
              {field.form_field_require && <Text style={styles.required}> *</Text>}
            </Text>
            <FieldInput
              field={field}
              value={answers[field.form_field_id]}
              onChange={v => setAnswer(field.form_field_id, v)}
              fileValue={fileAnswers[field.form_field_id] ?? null}
              onFileChange={f => setFileAnswer(field.form_field_id, f)}
            />
            {fieldErrors[field.form_field_id] ? (
              <Text style={styles.fieldErrorText}>{fieldErrors[field.form_field_id]}</Text>
            ) : null}
          </View>
        ))}

        {form.requires_teacher_validation && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Docente validador <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.teacherHint}>
              Este formulario requiere la aprobación de un docente. Buscá y seleccioná el docente que avalará tu solicitud.
            </Text>
            <TeacherSearch
              selected={selectedTeacher}
              onSelect={t => {
                setSelectedTeacher(t);
                if (t) setTeacherError(null);
              }}
              error={teacherError}
            />
          </View>
        )}

        {submitStatus ? (
          <View
            style={[
              styles.statusCard,
              submitStatus.type === 'success' ? styles.statusCardSuccess : styles.statusCardError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                submitStatus.type === 'success' ? styles.statusTextSuccess : styles.statusTextError,
              ]}
            >
              {submitStatus.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonWrapper}>
          <RoundedButton
            text={submitting ? 'Enviando...' : 'Enviar formulario'}
            enabled={!submitting}
            onPress={handleSubmit}
          />
          {submitting ? (
            <View style={styles.buttonSpinnerOverlay} pointerEvents="none">
              <ActivityIndicator color="white" />
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

interface FieldInputProps {
  field: FormField;
  value: string | null;
  onChange: (v: string | null) => void;
  fileValue?: LocalFile | null;
  onFileChange?: (f: LocalFile | null) => void;
}

const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange, fileValue, onFileChange }) => {
  const type = field.form_field_type.value;

  if (type === 'checkbox') {
    return (
      <Switch
        value={value === 'true'}
        onValueChange={v => onChange(v ? 'true' : 'false')}
        trackColor={{ true: lightModeColors.institutional }}
      />
    );
  }

  if (type === 'options' && field.options) {
    return (
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={value ?? ''} onValueChange={v => onChange(v === '' ? null : String(v))}>
          <Picker.Item label="Seleccionar..." value="" />
          {field.options.map(opt => (
            <Picker.Item key={opt.form_option_id} label={opt.form_option_label} value={String(opt.form_option_id)} />
          ))}
        </Picker>
      </View>
    );
  }

  if (type === 'catalog' && field.catalog) {
    return (
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={value ?? ''} onValueChange={v => onChange(v === '' ? null : String(v))}>
          <Picker.Item label="Seleccionar..." value="" />
          {field.catalog.items.map(item => (
            <Picker.Item key={item.catalog_item_id} label={item.catalog_item_label} value={String(item.catalog_item_id)} />
          ))}
        </Picker>
      </View>
    );
  }

  if (type === 'adjunto') {
    const handlePick = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled) return;
        const asset = result.assets[0];
        onFileChange?.({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? 'application/octet-stream',
          file: (asset as any).file ?? undefined,
        });
      } catch {
        Alert.alert('Error', 'No se pudo seleccionar el archivo.');
      }
    };

    return (
      <TouchableOpacity style={styles.filePicker} onPress={handlePick} activeOpacity={0.8}>
        <MaterialIcon
          name={fileValue ? 'file-check' : 'upload'}
          fontSize={22}
          color={fileValue ? '#388E3C' : lightModeColors.institutional}
        />
        <Text
          style={fileValue ? styles.filePickedText : styles.filePickerText}
          numberOfLines={1}
        >
          {fileValue ? fileValue.name : 'Seleccionar archivo'}
        </Text>
        {fileValue ? (
          <TouchableOpacity onPress={() => onFileChange?.(null)} hitSlop={8}>
            <MaterialIcon name="close-circle" fontSize={18} color="#D32F2F" />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  }

  const keyboardType =
    type === 'numero' ? 'numeric' :
    type === 'padron' ? 'numeric' :
    type === 'mail' ? 'email-address' :
    'default';

  return (
    <TextInput
      style={styles.input}
      value={value ?? ''}
      onChangeText={v => onChange(v === '' ? null : v)}
      keyboardType={keyboardType}
      autoCapitalize={type === 'mail' ? 'none' : 'sentences'}
      placeholder={`Ingresá ${field.form_field_label.toLowerCase()}`}
      placeholderTextColor="#aaa"
      maxLength={type === 'padron' ? 7 : undefined}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16 },
  container: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 22, fontWeight: 'bold', color: lightModeColors.institutional },
  description: { fontSize: 15, color: '#555' },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 14, color: '#1565C0' },
  fieldContainer: { gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  required: { color: '#D32F2F' },
  fieldErrorText: { color: '#D32F2F', fontSize: 12, fontWeight: '600' },
  teacherHint: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  filePickerText: { flex: 1, color: lightModeColors.institutional, fontWeight: '600', fontSize: 13 },
  filePickedText: { flex: 1, color: '#388E3C', fontWeight: '600', fontSize: 13 },
  statusCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusCardSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  statusCardError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#C62828',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#1B5E20',
  },
  statusTextError: {
    color: '#B71C1C',
  },
  buttonWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  buttonSpinnerOverlay: {
    position: 'absolute',
    right: 18,
  },
});

export default DigitalFormScreen;
