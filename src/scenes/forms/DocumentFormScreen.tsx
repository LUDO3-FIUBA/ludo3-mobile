import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcon } from '../../components';
import { RoundedButton } from '../../components';
import { formsRepository } from '../../repositories';
import { LocalFile } from '../../repositories/forms';
import FormDetail from '../../models/FormDetail';
import { TeacherModelSnakeCase } from '../../models/Teachers';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  formId: number;
  action?: 'download' | 'submit';
}

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

const DocumentFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { formId } = route.params as RouteParams;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [pickedFile, setPickedFile] = useState<LocalFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherModelSnakeCase | null>(null);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  useEffect(() => {
    formsRepository
      .fetchFormDetail(formId)
      .then(setForm)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el formulario.'))
      .finally(() => setLoading(false));
  }, [formId]);

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

  const handleDownload = () => {
    if (!form.document_source) {
      Alert.alert('Error', 'No hay documento disponible para descargar.');
      return;
    }
    Linking.openURL(form.document_source).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el documento.'),
    );
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
        // On Expo web, expo-document-picker provides the native browser File object.
        // On React Native (iOS/Android), this property is undefined.
        file: (asset as any).file ?? undefined,
      });
      setFileError(null);
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!pickedFile) {
      setFileError('Seleccioná un archivo antes de enviar.');
      return;
    }
    if (form.requires_teacher_validation && !selectedTeacher) {
      setTeacherError('Debés seleccionar un docente validador para enviar este formulario.');
      return;
    }
    setTeacherError(null);

    setSubmitting(true);
    setFileError(null);
    setSubmitStatus(null);
    try {
      await formsRepository.submitDocumentForm(formId, pickedFile, selectedTeacher?.id);
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

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>{form.form_name}</Text>
        {!!form.form_description && (
          <Text style={styles.description}>{form.form_description}</Text>
        )}
        {!!form.form_information && (
          <View style={styles.infoBox}>
            <MaterialIcon name="information" fontSize={18} color="#1976D2" />
            <Text style={styles.infoText}>{form.form_information}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Paso 1 — Descargá y completá el formulario</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.8}>
          <MaterialIcon name="file-pdf-box" fontSize={24} color="white" />
          <Text style={styles.downloadText}>Descargar formulario</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Paso 2 — Subí el formulario completado</Text>
        <TouchableOpacity style={styles.uploadPicker} onPress={handlePickFile} activeOpacity={0.8}>
          <MaterialIcon
            name={pickedFile ? 'file-check' : 'upload'}
            fontSize={28}
            color={pickedFile ? '#388E3C' : '#1976D2'}
          />
          <Text style={pickedFile ? styles.pickedText : styles.pickerText} numberOfLines={1}>
            {pickedFile ? pickedFile.name : 'Seleccionar archivo (PDF o imagen)'}
          </Text>
          {pickedFile ? (
            <TouchableOpacity onPress={() => setPickedFile(null)} hitSlop={8}>
              <MaterialIcon name="close-circle" fontSize={20} color="#D32F2F" />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
        {fileError ? <Text style={styles.fieldErrorText}>{fileError}</Text> : null}

        {form.requires_teacher_validation && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Paso 3 — Seleccioná un docente validador</Text>
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
          </>
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16 },
  container: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 14,
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
  divider: { height: 1, backgroundColor: '#eee' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#444', textTransform: 'uppercase' },
  teacherHint: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    paddingVertical: 14,
  },
  downloadText: { color: 'white', fontSize: 16, fontWeight: '700' },
  uploadPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  pickerText: { flex: 1, color: '#1976D2', fontSize: 14, fontWeight: '600' },
  pickedText: { flex: 1, color: '#388E3C', fontSize: 14, fontWeight: '600' },
  fieldErrorText: { color: '#D32F2F', fontSize: 12, fontWeight: '600' },
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

export default DocumentFormScreen;
