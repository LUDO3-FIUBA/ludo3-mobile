import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { Evaluation } from '../../models';
import { evaluationsRepository } from '../../repositories';
import { makeRequest } from '../authenticatedComponent';
import VerifyIdentityForEvaluationConfiguration from '../home/subsections/evaluation_identity_configuration';
import { lightModeColors } from '../../styles/colorPalette';

interface RouteParams {
  evaluation: Evaluation;
}

const AddEvaluationSubmissionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { evaluation } = route.params as RouteParams;

  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<{ uri: string; name: string; type?: string } | null>(null);
  const requiresIdentity = evaluation.requires_identity === true;

  const submitWithoutIdentity = async () => {
    setSubmitting(true);

    try {
      await makeRequest(
        () => evaluationsRepository.submitEvaluation(`${evaluation.id}`, submissionText, submissionFile || undefined),
        navigation,
      );

      Alert.alert(
        'Éxito',
        `Entrega realizada con éxito.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.popToTop(),
          },
        ],
      );
    } catch (error) {
      console.log('Error', error);
      Alert.alert(
        'Error',
        'Hubo un error, no pudimos registrar la entrega del examen. Por favor intenta nuevamente.',
      );
      setSubmitting(false);
    }
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      const { uri, name, type, size } = res as any;
      const ext = name?.split('.').pop()?.toLowerCase() || '';
      const allowed = ['pdf', 'jpeg', 'jpg', 'png', 'webp'];
      if (!allowed.includes(ext)) {
        Alert.alert('Archivo no permitido', 'Solo se permiten PDF, JPEG, JPG, PNG o WEBP.');
        return;
      }
      if (name && name.length > 100) {
        Alert.alert('Nombre de archivo muy largo', 'El nombre del archivo no puede exceder 100 caracteres.');
        return;
      }
      const bytes = typeof size === 'number' ? size : 0;
      const isPdf = ext === 'pdf';
      const maxPdf = 5 * 1024 * 1024;
      const maxImage = 2 * 1024 * 1024;
      if ((isPdf && bytes > maxPdf) || (!isPdf && bytes > maxImage)) {
        Alert.alert('Archivo muy grande', isPdf ? 'El PDF debe ser menor a 5 MB.' : 'La imagen debe ser menor a 2 MB.');
        return;
      }
      setSubmissionFile({ uri, name, type });
    } catch (err: any) {
      if (DocumentPicker.isCancel && DocumentPicker.isCancel(err)) {
        return;
      }
      console.error('Error picking file', err);
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  const onSubmit = async () => {
    if (submitting) {
      return;
    }

    if (requiresIdentity) {
      navigation.navigate('TakePicture', {
        configuration: new VerifyIdentityForEvaluationConfiguration(
          'Verifiquemos tu identidad',
          `${evaluation.id}`,
          submissionText,
        ).toObject(),
        title: 'Rendir examen',
      });
      return;
    }

    await submitWithoutIdentity();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Agregar entrega</Text>
        <Text style={styles.subtitle}>{evaluation.evaluation_name}</Text>
        <Text style={styles.label}>Texto de entrega (opcional)</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={7}
          value={submissionText}
          onChangeText={setSubmissionText}
          placeholder="Escribe una nota para tu entrega"
          placeholderTextColor="#888"
          textAlignVertical="top"
          editable={!submitting}
          maxLength={1500}
        />
        <Text style={styles.label}>Archivo adjunto (opcional)</Text>
        <Text style={styles.hint}>PDF máximo 5 MB — Imágenes máximo 2 MB</Text>
        {submissionFile ? (
          <View>
            <Text>{submissionFile.name}</Text>
            <TouchableOpacity onPress={() => setSubmissionFile(null)}>
              <Text style={{ color: '#ef4444' }}>Quitar archivo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
            <Text style={{ color: '#1f2937' }}>Seleccionar archivo</Text>
          </TouchableOpacity>
        )}
        <RoundedButton
          text={submitting ? 'Enviando...' : 'Enviar entrega'}
          enabled={!submitting}
          onPress={onSubmit}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    elevation: 3,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 140,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
});

export default AddEvaluationSubmissionScreen;
