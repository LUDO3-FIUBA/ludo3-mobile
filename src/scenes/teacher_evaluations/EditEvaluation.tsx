// src/scenes/teacher_evaluations/EditEvaluation.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { teacherEvaluationsRepository } from '../../repositories';
import EvaluationForm, { EvaluationFormValues } from './EvaluationForm';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';

type Params = { evaluation: TeacherEvaluation };

export default function EditEvaluation() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const semester = useAppSelector(selectSemesterData)!;
  const { evaluation } = route.params as Params;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parentEvaluationId = evaluation.parentEvaluation ?? null;
  const initialParentEvaluation =
    semester.evaluations.find((semesterEvaluation) => semesterEvaluation.id === parentEvaluationId) || null;

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
        values.requireQrScan,
        values.requireIdentityVerification,
        values.isGradeable,
        values.parentEvaluation ? values.parentEvaluation.id : null,
      );
      navigation.goBack();
    } catch {
      Alert.alert('Te fallamos', 'No pudimos editar esta evaluación. Volvé a intentar en unos minutos.');
    } finally {
      setSaving(false);
    }
  };

  const onDeleteEvaluation = async () => {
    try {
      setDeleting(true);
      await teacherEvaluationsRepository.deleteEvaluation(evaluation.id);
      if (navigation.canGoBack()) {
        navigation.pop(2);
      } else {
        navigation.replace('EvaluationsList', {
          semester,
          evaluations: semester.evaluations,
        });
      }
    } catch {
      Alert.alert('Te fallamos', 'No pudimos eliminar esta evaluación. Volvé a intentar en unos minutos.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      '¿Estás seguro de que querés eliminar la evaluación?',
      'Esta decisión es irreversible.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDeleteEvaluation,
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <EvaluationForm
      titleButton="Guardar cambios"
      submitting={saving || deleting}
      initialValues={{
        evaluationName: evaluation.evaluationName,
        minimumPassingGrade: String(evaluation.passingGrade) ?? '',
        startDate: start,
        startTime: start,
        finishDate: end,
        finishTime: end,
        requireIdentityVerification: evaluation.requiresIdentity ?? false,
        requireQrScan: evaluation.requiresQr ?? false,
        isGradeable: evaluation.isGradeable ?? true,
        isMakeUp: !!parentEvaluationId,
        parentEvaluation: initialParentEvaluation,
      }}
      onSubmit={onSubmit}
      semester={semester}
      onDelete={confirmDelete}
      deleting={deleting}
      deleteButtonText="Eliminar evaluación"
      currentEvaluationId={evaluation.id}
    />
  );
}