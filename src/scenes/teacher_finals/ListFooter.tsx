import React, { useState } from 'react';
import { View, Text } from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { RoundedButton } from '../../components';
import { evaluationGradesList as style } from '../../styles';
import { makeRequest } from '../../networking/makeRequest';
import { useNavigation } from '@react-navigation/native';
import { teacherEvaluationsRepository } from '../../repositories';
import { StatusCodeError } from '../../networking';

interface ListFooterProps {
  isEditable: boolean;
  gradeLoading: boolean;
  hasWarnings: () => boolean;
  ableToCloseAct: boolean;
  deletionsInProgress: boolean;
  loading: boolean;
  saveChanges: (onSuccess?: () => void) => void;
  closeAct: (navigation: any) => Promise<void>;
  getFinal: () => any;
  setFinalExams: (finalExams: any) => void;
  setLoading: (loading: boolean) => void;
  addNotify: (notify: boolean) => void;
  finalExams: any[];
  gradeChanges: any;
}

const ListFooter: React.FC<ListFooterProps> = ({
  isEditable,
  gradeLoading,
  hasWarnings,
  ableToCloseAct,
  deletionsInProgress,
  loading,
  saveChanges,
  closeAct,
  getFinal,
  setFinalExams,
  setLoading,
  addNotify,
  finalExams,
  gradeChanges
}) => {
  const navigation = useNavigation();
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  if (!isEditable) return null;

  // const studentAdded = async (padron: string) => {
  //   console.log("Adding Student");

  //   await makeRequest(() => teacherEvaluationsRepository.addSubmissionToEvaluation(getFinal().id, padron), navigation)
  //     .then(async (finalExam: any) => {
  //       setFinalExams((prev: any[]) => [...prev, [finalExam, finalExam.grade]])
  //       if (finalExams.length === 1) {
  //         addNotify(true);
  //       }
  //     })
  //     .catch((error: any) => {
  //       setLoading(false)
  //       if (error instanceof StatusCodeError && error.code === 404) {
  //         Alert.alert(
  //           'Alumno no encontrado',
  //           `Parece que no existe un alumno registrado con el padrón ${padron}.`,
  //         );
  //       } else {
  //         Alert.alert(
  //           '¿Qué pasó?',
  //           'No sabemos pero no pudimos agregar al alumno que pediste. ' +
  //             'Volvé a intentar en unos minutos.',
  //         );
  //       }
  //     });
  // }

  return (
    <View style={style().listHeaderFooter}>
      <AlertDialog
        visible={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        mode="confirm"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={() => { confirmDialog?.onConfirm(); setConfirmDialog(null); }}
        onCancel={() => setConfirmDialog(null)}
      />
      <RoundedButton
        text="Agregar alumno"
        style={style().button}
        enabled={!gradeLoading}
        onPress={async () => {
          // prompt(
          //   'Padrón del alumno',
          //   '',
          //   [
          //     {
          //       text: 'Cancelar',
          //       style: 'cancel',
          //     },
          //     {
          //       text: 'Agregar',
          //       onPress: async padron => {
          //         studentAdded(padron);
          //       },
          //     },
          //   ],
          //   {}
          // );
        }}

      />
      <View />
      {hasWarnings() && (
        <Text style={style().disclaimer}>
          &#x26A0;&#xFE0F; significa que el alumno necesita aprobar las
          correlativas a esta materia aún.
        </Text>
      )}
      <RoundedButton
        text="Cerrar el Acta"
        style={style().button}
        enabled={
          !loading &&
          ableToCloseAct &&
          !gradeLoading &&
          !deletionsInProgress
        }
        onPress={async () => {
          if (gradeChanges.size > 0) {
            setConfirmDialog({
              title: '¡Esperá!',
              message: 'Todavía tenés cambios sin guardar. ¿Querés guardarlos antes de cerrar el acta?',
              onConfirm: async () => {
                await saveChanges(async () => {
                  await closeAct(navigation);
                });
              },
            });
            return;
          } else if (hasWarnings()) {
            setConfirmDialog({
              title: '¡Esperá!',
              message: 'Tenés algunos alumnos que no tienen todas las correlativas. ¿Estás seguro que querés cerrar el acta con sus notas?',
              onConfirm: async () => {
                await closeAct(navigation);
              },
            });
            return;
          } else {
            await closeAct(navigation);
          }
        }}

      />
    </View>
  );
};

export default ListFooter;
