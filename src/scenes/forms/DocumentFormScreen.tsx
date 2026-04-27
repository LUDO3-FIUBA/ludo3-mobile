import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcon } from '../../components';
import { RoundedButton } from '../../components';
import { formsRepository } from '../../repositories';
import { LocalFile } from '../../repositories/forms';
import FormDetail from '../../models/FormDetail';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  formId: number;
  action?: 'download' | 'submit';
}

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
};

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

    setSubmitting(true);
    setFileError(null);
    setSubmitStatus(null);
    try {
      await formsRepository.submitDocumentForm(formId, pickedFile);
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
          <div>
            <View style={styles.divider} />
            <View style={styles.infoBox}>
              <MaterialIcon name="information" fontSize={18} color="#1976D2" />
              <Text style={styles.infoText}>{form.form_information}</Text>
            </View>
          </div>
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
