// src/scenes/teacher_evaluations/AddEvaluation.tsx
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { teacherEvaluationsRepository } from '../../repositories';
import EvaluationForm, { EvaluationFormValues } from './EvaluationForm';
import AlertDialog from '../../components/AlertDialog';

export default function AddEvaluation() {
  const navigation = useNavigation();
  const semester = useAppSelector(selectSemesterData)!;
  const [creating, setCreating] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const onSubmit = async (values: EvaluationFormValues) => {
    try {
      setCreating(true);
      await teacherEvaluationsRepository.create(
        semester,
        values.evaluationName,
        values.description,
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
      setAlertDialog({ title: 'Te fallamos', message: 'No pudimos crear esta evaluación. Volvé a intentar en unos minutos.' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <EvaluationForm
        titleButton="Agregar evaluación"
        submitting={creating}
        initialValues={{
          evaluationName: '',
          description: '',
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
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
    </>
  );
}