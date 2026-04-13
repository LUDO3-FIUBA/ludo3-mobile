import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { lightModeColors } from '../../styles/colorPalette';
import {
  EvaluationDateRangeCard,
  EvaluationDetailsHeader,
  EvaluationResultCard,
  GraderUpdatedCard,
  MaterialIcon,
  SubmissionDateRow,
  SubmissionTextCard,
} from '../../components';
import { Evaluation, EvaluationSubmission, Teacher } from '../../models';
import { evaluationsRepository } from '../../repositories';
import { useNavigation } from '@react-navigation/native';
import { getLateSubmissionInfo } from '../../utils/lateSubmission';
import { evaluationDetailsScreenStyles as styles, evaluationDetailsTextStyles } from '../../styles/evaluationDetails';


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
  const detailedEvaluation = evaluationSubmission?.evaluation || evaluation;
  const subjectName = (evaluation as any).semester?.commission?.subject_name || '–';
  const endDate = formatDate(detailedEvaluation.end_date);
  const startDate = formatDate(detailedEvaluation.start_date);
  const graderName = getGraderName(evaluationSubmission?.grader);
  const grade: number = evaluationSubmission?.grade || 0;
  const createdAtDate = formatDate(evaluationSubmission?.created_at);
  const updatedAtDate = formatDate(evaluationSubmission?.updated_at);
  const isNumericEvaluation = getIsNumericEvaluation(detailedEvaluation);
  const normalizedSubmissionStatus = (evaluationSubmission?.submission_status || '').toUpperCase();
  const isApprovedSubmission = normalizedSubmissionStatus === 'APROBADO';
  const isFailedSubmission = normalizedSubmissionStatus === 'DESAPROBADO';
  const lateInfo = getLateSubmissionInfo(evaluationSubmission?.created_at, detailedEvaluation.end_date);
  const isLate = lateInfo.isLate;
  const lateByText = lateInfo.lateByText;
  const hasEvaluationStarted = detailedEvaluation.start_date
    ? moment().isSameOrAfter(moment(detailedEvaluation.start_date))
    : true;
  const isQrRequired = Boolean(detailedEvaluation.requires_qr);
  const isIdentityVerificationRequired = Boolean(detailedEvaluation.requires_identity);
  const isSubmitBlockedOnWeb = !isQrRequired && isIdentityVerificationRequired;
  
  const failedExam = isNumericEvaluation
    ? evaluationSubmission?.grade !== null && evaluationSubmission?.grade !== undefined && grade < (detailedEvaluation.passing_grade || 0)
    : isFailedSubmission;
  
  const circleProgress = isNumericEvaluation
    ? grade / 10
    : (isApprovedSubmission || isFailedSubmission)
      ? 1
      : 0;
  
    const circleText = isNumericEvaluation
    ? (evaluationSubmission?.grade ?? '–')
    : isApprovedSubmission
      ? 'Aprobado'
      : isFailedSubmission
        ? 'Desaprobado'
        : '–';
  
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

  const onScanQRPress = () => {
    navigation.push('ScanQRScreen', { evaluation });
  };

  return (
    <ScrollView style={styles.container}>
      <EvaluationDetailsHeader title={detailedEvaluation.evaluation_name} subtitle={subjectName} />
      <EvaluationDateRangeCard startDate={detailedEvaluation.start_date ? startDate : '–'} endDate={endDate} />

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="information-outline" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View>
            <Text style={evaluationDetailsTextStyles.passingGradeText}>{evaluationStatus}</Text>
            <Text style={evaluationDetailsTextStyles.passingGradeLabel}>Estado</Text>
          </View>
        </View>
        <SubmissionDateRow dateText={evaluationSubmission?.created_at ? createdAtDate : '–'} isLate={isLate} lateByText={lateByText} />
      </View>

      <SubmissionTextCard submissionText={evaluationSubmission?.submission_text} />

      <EvaluationResultCard
        progress={circleProgress}
        circleText={String(circleText)}
        failed={failedExam}
        isNumericEvaluation={isNumericEvaluation}
        passingGrade={detailedEvaluation.passing_grade}
      />

      {evaluationStatus !== EvaluationStatus.NOT_TAKEN &&
        <GraderUpdatedCard
          graderName={graderName}
          updatedAt={evaluationSubmission?.updated_at ? updatedAtDate : '–'}
        />}

      {evaluationStatus === EvaluationStatus.NOT_TAKEN && hasEvaluationStarted && !isQrRequired &&
        <View style={[styles.card, { marginBottom: 120 }]}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitBlockedOnWeb && styles.disabledButton]}
            onPress={onAddSubmissionPress}
            disabled={isSubmitBlockedOnWeb}
          >
            <Text style={[styles.submitButtonText, isSubmitBlockedOnWeb && styles.disabledButtonText]}>
              Añadir entrega
            </Text>
          </TouchableOpacity>
          <Text style={styles.submitHintText}>
            {isIdentityVerificationRequired
              ? 'Esta evaluación requiere verificación de identidad y no está disponible en versión web. Por favor, utiliza la aplicación móvil.'
              : 'Esta evaluación no requiere QR ni verificación de identidad.'}
          </Text>
        </View>}

      {evaluationStatus === EvaluationStatus.NOT_TAKEN && hasEvaluationStarted && isQrRequired &&
        <View style={[styles.card, { marginBottom: 120, alignItems: 'center' }]}>
          <TouchableOpacity
            style={[styles.qrButton, styles.disabledButton]}
            onPress={onScanQRPress}
            disabled
          >
            <MaterialIcon name="qrcode-scan" fontSize={48} color="#f2f2f2" />
          </TouchableOpacity>
          <Text style={styles.submitHintText}>
            Funcionalidad no disponible en versión web. Por favor, utiliza la aplicación móvil para entregar esta evaluación.
          </Text>
        </View>}
    </ScrollView>
  );
};

function getEvaluationStatus(evaluationSubmission: EvaluationSubmission | undefined): EvaluationStatus {
  if (!evaluationSubmission) {
    return EvaluationStatus.NOT_TAKEN
  }

  const hasNumericGrade = evaluationSubmission.grade !== null && evaluationSubmission.grade !== undefined;
  const normalizedStatus = (evaluationSubmission.submission_status || '').toUpperCase();
  const hasFinalStatus = normalizedStatus === 'APROBADO' || normalizedStatus === 'DESAPROBADO';

  if (!hasNumericGrade && !hasFinalStatus) {
    return EvaluationStatus.TAKEN_NOT_GRADED
  }

  return EvaluationStatus.TAKEN_GRADED
}

export default EvaluationDetailsScreen;

function getIsNumericEvaluation(evaluation: Evaluation | any): boolean {
  return evaluation?.is_gradeable;
}

function formatDate(date: string | null | undefined) {
  return moment(date).format('HH:mm D/MM/YY');
}

function getGraderName(grader: Teacher | undefined) {
  return grader ? `${grader?.first_name} ${grader?.last_name}` : '–';
}
