import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FilePicker, RoundedButton } from '../../components';
import type { SubmissionFileValue } from '../../components';
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
  const [submissionFile, setSubmissionFile] = useState<SubmissionFileValue | null>(null);
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
        <FilePicker value={submissionFile} onChange={setSubmissionFile} />
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
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
});

export default AddEvaluationSubmissionScreen;
