// src/scenes/teacher_evaluations/EditEvaluation.tsx
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { teacherEvaluationsRepository } from '../../repositories';
import EvaluationForm, { EvaluationFormValues } from './EvaluationForm';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import AlertDialog from '../../components/AlertDialog';

type Params = { evaluation: TeacherEvaluation };

export default function EditEvaluation() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const semester = useAppSelector(selectSemesterData)!;
  const { evaluation } = route.params as Params;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

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
      setAlertDialog({ title: 'Te fallamos', message: 'No pudimos editar esta evaluación. Volvé a intentar en unos minutos.' });
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
      setAlertDialog({ title: 'Te fallamos', message: 'No pudimos eliminar esta evaluación. Volvé a intentar en unos minutos.' });
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    setConfirmDialog({
      title: '¿Estás seguro de que querés eliminar la evaluación?',
      message: 'Sus recuperatorios asociados también se eliminarán. Esta decisión es irreversible.',
      onConfirm: onDeleteEvaluation,
    });
  };

  return (
    <>
      <EvaluationForm
        titleButton="Guardar cambios"
        submitting={saving || deleting}
        initialValues={{
          evaluationName: evaluation.evaluationName,
          description: evaluation.description ?? '',
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
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      <AlertDialog
        visible={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        mode="confirm"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => { confirmDialog?.onConfirm(); setConfirmDialog(null); }}
        onCancel={() => setConfirmDialog(null)}
      />
    </>
  );
}