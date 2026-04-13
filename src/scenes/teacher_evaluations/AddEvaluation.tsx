// src/scenes/teacher_evaluations/AddEvaluation.tsx
import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { teacherEvaluationsRepository } from '../../repositories';
import EvaluationForm, { EvaluationFormValues } from './EvaluationForm';

export default function AddEvaluation() {
  const navigation = useNavigation();
  const semester = useAppSelector(selectSemesterData)!;
  const [creating, setCreating] = useState(false);

  const showErrorAlert = (message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message);
      return;
    }

    Alert.alert('Te fallamos', message);
  };

  const onSubmit = async (values: EvaluationFormValues) => {
    try {
      setCreating(true);
      await teacherEvaluationsRepository.create(
        semester,
        values.evaluationName,
        new Date(values.startDate!.getFullYear(), values.startDate!.getMonth(), values.startDate!.getDate(), values.startTime!.getHours(), values.startTime!.getMinutes()),
        new Date(values.finishDate!.getFullYear(), values.finishDate!.getMonth(), values.finishDate!.getDate(), values.finishTime!.getHours(), values.finishTime!.getMinutes()),
        values.minimumPassingGrade,
        values.requireQrScan,
        values.requireIdentityVerification,
        values.isGradeable,
        values.parentEvaluation ? values.parentEvaluation.id : null,
      );
      navigation.goBack();
    } catch {
      showErrorAlert('No pudimos crear esta evaluación. Volvé a intentar en unos minutos.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <EvaluationForm
      titleButton="Agregar evaluación"
      submitting={creating}
      initialValues={{
        evaluationName: '',
        minimumPassingGrade: '',
        startDate: null,
        startTime: null,
        finishDate: null,
        finishTime: null,
        requireIdentityVerification: false,
        requireQrScan: false,
        isGradeable: true,
        isMakeUp: false,
        parentEvaluation: null,
      }}
      onSubmit={onSubmit}
      semester={semester}
    />
  );
}