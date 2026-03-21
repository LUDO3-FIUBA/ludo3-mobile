// src/scenes/teacher_evaluations/EditEvaluation.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { teacherEvaluationsRepository } from '../../repositories';
import EvaluationForm, { EvaluationFormValues } from './EvaluationForm';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';

type Params = { evaluation: TeacherEvaluation };

export default function EditEvaluation() {
  const navigation = useNavigation();
  const route = useRoute();
  const { evaluation } = route.params as Params;
  const [saving, setSaving] = useState(false);

  const start = new Date(evaluation.startDate);
  const end = new Date(evaluation.endDate);

  const onSubmit = async (values: EvaluationFormValues) => {
    try {
      setSaving(true);
      await teacherEvaluationsRepository.update(
        evaluation.id,
        values.evaluationName,
        new Date(values.startDate!.getFullYear(), values.startDate!.getMonth(), values.startDate!.getDate(), values.startTime!.getHours(), values.startTime!.getMinutes()),
        new Date(values.finishDate!.getFullYear(), values.finishDate!.getMonth(), values.finishDate!.getDate(), values.finishTime!.getHours(), values.finishTime!.getMinutes()),
        values.minimumPassingGrade,
        values.requireIdentityVerification,
        values.requireQrScan,
      );
      navigation.goBack();
    } catch {
      Alert.alert('Te fallamos', 'No pudimos editar esta evaluación. Volvé a intentar en unos minutos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EvaluationForm
      titleButton="Guardar cambios"
      submitting={saving}
      initialValues={{
        evaluationName: evaluation.evaluationName,
        minimumPassingGrade: String(evaluation.passingGrade),
        startDate: start,
        startTime: start,
        finishDate: end,
        finishTime: end,
        requireIdentityVerification: (evaluation as any).requiresIdentity ?? false,
        requireQrScan: (evaluation as any).requiresQr ?? false,
      }}
      onSubmit={onSubmit}
    />
  );
}