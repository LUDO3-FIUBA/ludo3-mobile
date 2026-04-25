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
import { MaterialIcon } from '../../components';
import { RoundedButton } from '../../components';
import { formsRepository } from '../../repositories';
import FormDetail from '../../models/FormDetail';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  formId: number;
  action?: 'download' | 'submit';
}

const DocumentFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { formId } = route.params as RouteParams;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    formsRepository
      .fetchFormDetail(formId)
      .then(setForm)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el formulario.'))
      .finally(() => setLoading(false));
  }, []);

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

  const handleSubmit = async () => {
    if (submitting) return;
    Alert.alert(
      'Enviar formulario',
      'Esta funcionalidad estará disponible próximamente (integración con Firebase Storage pendiente).',
      [{ text: 'OK' }],
    );
    // TODO: integrar Firebase Storage — implementar selección y carga del archivo
    // setSubmitting(true);
    // try {
    //   await formsRepository.submitDocumentForm(formId);
    //   Alert.alert('Éxito', 'Formulario enviado correctamente.', [
    //     { text: 'OK', onPress: () => navigation.popToTop() },
    //   ]);
    // } catch {
    //   Alert.alert('Error', 'No se pudo enviar el formulario.');
    // } finally {
    //   setSubmitting(false);
    // }
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
        <View style={styles.uploadPlaceholder}>
          <MaterialIcon name="upload" fontSize={32} color="#aaa" />
          <Text style={styles.uploadText}>
            La subida de archivos estará disponible próximamente.
          </Text>
        </View>

        <RoundedButton
          text={submitting ? 'Enviando...' : 'Enviar formulario'}
          enabled={!submitting}
          onPress={handleSubmit}
        />
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
  uploadPlaceholder: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
});

export default DocumentFormScreen;
