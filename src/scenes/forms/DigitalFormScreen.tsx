import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RoundedButton, MaterialIcon } from '../../components';
import { formsRepository } from '../../repositories';
import FormDetail, { FormField } from '../../models/FormDetail';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  formId: number;
}

type AnswerMap = Record<number, string | null>;

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
};

const DigitalFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { formId } = route.params as RouteParams;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

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
  };

  const handleSubmit = async () => {
    if (!form || submitting) return;

    const missing = form.fields.filter(
      f => f.form_field_require && (answers[f.form_field_id] === null || answers[f.form_field_id] === ''),
    );
    if (missing.length > 0) {
      Alert.alert('Campos obligatorios', `Completá: ${missing.map(f => f.form_field_label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await formsRepository.submitDigitalForm(
        formId,
        form.fields.map(f => ({ field_id: f.form_field_id, answer_value: answers[f.form_field_id] ?? null })),
      );
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
            <FieldInput field={field} value={answers[field.form_field_id]} onChange={v => setAnswer(field.form_field_id, v)} />
          </View>
        ))}

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
}

const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange }) => {
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
