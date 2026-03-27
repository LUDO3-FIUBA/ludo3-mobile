import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../../styles/colorPalette';
import moment from 'moment';
import { MaterialIcon } from '../../components';
import { Evaluation, EvaluationSubmission, Teacher } from '../../models';
import { evaluationsRepository } from '../../repositories';
import { useNavigation } from '@react-navigation/native';


enum EvaluationStatus {
  UNKNOWN = "–",
  NOT_TAKEN = "No entregado",
  TAKEN_NOT_GRADED = "Entregado, esperando corrección",
  TAKEN_GRADED = "Corregido"
}

const EvaluationDetailsScreen = ({ route }: { route: any }) => {
  const { evaluation }: { evaluation: Evaluation } = route.params;
  const navigation = useNavigation<any>();
  const [evaluationSubmission, setEvaluationSubmission] = useState<EvaluationSubmission | undefined>(undefined)
  const [evaluationStatus, setEvaluationStatus] = useState(EvaluationStatus.UNKNOWN)
  const endDate = formatDate(evaluation.end_date);
  const startDate = formatDate(evaluation.start_date);
  const graderName = getGraderName(evaluationSubmission?.grader);
  const grade: number = evaluationSubmission?.grade || 0;
  const createdAtDate = formatDate(evaluationSubmission?.created_at);
  const updatedAtDate = formatDate(evaluationSubmission?.updated_at);
  const failedExam = evaluationSubmission?.grade && grade < evaluation.passing_grade;

  const fetchSubmission = async () => {
    if (!evaluation.id) return;

    try {
      const evaluationSubmissions = await evaluationsRepository.fetchMySubmissions(evaluation.id)
      setEvaluationSubmission(evaluationSubmissions[0])
      setEvaluationStatus(getEvaluationStatus(evaluationSubmissions[0]))
    } catch (err) {
      console.error(`EvaluationDetails - ${err}`)
    }
  };

  useEffect(() => {
    if (!evaluation.id) return;

    fetchSubmission()
  }, [evaluation]);

  const onAddSubmissionPress = () => {
    navigation.navigate('AddEvaluationSubmission', {
      evaluation,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{evaluation.evaluation_name}</Text>
      <Text style={styles.header2}>{evaluation.semester.commission.subject_name}</Text>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-clock" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View style={{ flexGrow: 1 }}>
            <Text style={styles.cardTitle}>Inicio</Text>
            <Text style={styles.cardText}>{evaluation.start_date ? startDate : `–`}</Text>
          </View>
          <MaterialIcon name="chevron-right" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View style={{ flexGrow: .5 }}>
            <Text style={styles.cardTitle}>Fin</Text>
            <Text style={styles.cardText}>{endDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="information-outline" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.passingGradeText}>{evaluationStatus}</Text>
            <Text style={styles.passingGradeLabel}>Estado</Text>
          </View>
        </View>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-today" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.passingGradeText}>{evaluationSubmission?.created_at ? createdAtDate : `–`}</Text>
            <Text style={styles.passingGradeLabel}>Fecha de entrega</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Progress.Circle
            progress={grade / 10}
            formatText={(a) => grade || '–'}
            color={failedExam ? lightModeColors.menuOption : lightModeColors.institutional}
            unfilledColor='lightblue'
            strokeCap='round'
            size={135}
            thickness={12}
            showsText={true}
            borderWidth={0}
            textStyle={{ fontWeight: 'bold' }}
          />
          <Text style={styles.passingGradeLabel}>Nota obtenida</Text>
        </View>

        <View>
          <Text style={styles.passingGradeLabel}>Nota mínima de aprobación: {evaluation.passing_grade}</Text>
        </View>
      </View>

      {evaluationStatus !== EvaluationStatus.NOT_TAKEN &&
        <View style={[styles.card, { marginBottom: 120 }]}>
          <View style={styles.cardItem}>
            <MaterialIcon name="account-supervisor" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.passingGradeText}>{graderName}</Text>
              <Text style={styles.passingGradeLabel}>Corrector</Text>
            </View>
          </View>
          <View style={styles.cardItem}>
            <MaterialIcon name="calendar-edit" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.passingGradeText}>{evaluationSubmission?.updated_at ? updatedAtDate : `–`}</Text>
              <Text style={styles.passingGradeLabel}>Última fecha de actualización</Text>
            </View>
          </View>
        </View>}

      {evaluationStatus === EvaluationStatus.NOT_TAKEN && !evaluation.requires_qr &&
        <View style={[styles.card, { marginBottom: 120 }]}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onAddSubmissionPress}
          >
            <Text style={styles.submitButtonText}>
              Añadir entrega
            </Text>
          </TouchableOpacity>
          <Text style={styles.submitHintText}>
            {evaluation.requires_identity
              ? 'Esta evaluación no requiere QR, pero sí verificación de identidad.'
              : 'Esta evaluación no requiere QR ni verificación de identidad.'}
          </Text>
        </View>}
    </ScrollView>
  );
};

function getEvaluationStatus(evaluationSubmission: EvaluationSubmission | undefined): EvaluationStatus {
  if (!evaluationSubmission) {
    return EvaluationStatus.NOT_TAKEN
  }

  if (!evaluationSubmission.grade) {
    return EvaluationStatus.TAKEN_NOT_GRADED
  }

  return EvaluationStatus.TAKEN_GRADED
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header2: {
    fontSize: 20,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardText: {
    color: 'gray',
  },
  passingGradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  passingGradeLabel: {
    fontSize: 14,
    color: 'gray',
  },
  submitButton: {
    backgroundColor: lightModeColors.institutional,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitHintText: {
    fontSize: 13,
    color: 'gray',
  },
});

export default EvaluationDetailsScreen;

function formatDate(date: string | null | undefined) {
  return moment(date).format('HH:mm D/MM/YY');
}

function getGraderName(grader: Teacher | undefined) {
  return grader ? `${grader?.first_name} ${grader?.last_name}` : '–';
}
