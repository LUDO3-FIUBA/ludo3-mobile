import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import EntitySelectionModal from './EntitySelectionModal';
import { TeacherStudent } from '../../models/TeacherStudent';
import { teacherEvaluationsRepository, teacherSubmissionsRepository } from '../../repositories';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { MaterialIcon } from '../../components';
import { Submission } from '../../models/Submission';
import { useNavigation } from '@react-navigation/native';

interface Props {
  evaluation: TeacherEvaluation;
  submissions: Submission[];
  fetchData: () => Promise<void>;
  isActualUserChiefTeacher: boolean;
}

export function SubmissionsHeaderRight({ evaluation, fetchData, isActualUserChiefTeacher, submissions }: Props) {
  const semesterData = useAppSelector(selectSemesterData);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const navigation = useNavigation();

  const showEvaluationQR = () => {
    navigation.navigate('EvaluationQR', { evaluation });
  }

  const showEditEvaluation = () => {
  navigation.navigate('EditEvaluation', { evaluation });
};

  const addStudentSubmission = async (student: TeacherStudent) => {
    setModalVisible(false);
    await teacherEvaluationsRepository.addSubmissionToEvaluation(evaluation.id, student.id);
    // Force-refresh
    fetchData();
  };

  const autoAssignGraders = async () => {
    await teacherSubmissionsRepository.autoAssignGraders(evaluation.id);
    // Force-refresh
    fetchData();
  };

  const showConfirmAutoAssignGraders = () => {
    setConfirmDialog({
      title: 'Auto-asignar correctores',
      message: '¿Está seguro de que desea auto-asignar correctores para las entregas aún no calificadas? Se sobreescribirán los correctores ya asignados.\n\nPara ajustar las ponderaciones diríjase a Cuerpo Docente > Editar',
      onConfirm: autoAssignGraders,
    });
  };

  const showConfirmNotifyStudents = () => {
    setConfirmDialog({
      title: 'Notificar estudiantes',
      message: '¿Está seguro de que desea notificar a los estudiantes de sus notas? Se enviará una notificación a todos los estudiantes que hayan recibido una nota',
      onConfirm: () => teacherEvaluationsRepository.notifyStudents(evaluation.id),
    });
  };

  const semesterStudentsThatHaveNotSubmitted = () => {
    const submissionsStudents = submissions.map(sub => sub.student);
    const students = semesterData?.students || [];

    const semesterStudentsThatHaveNotSubmitted = [];
    for (const student of students) {
      const studentHasSubmitted = submissionsStudents.some(subStudent => subStudent.id === student.id);

      // Only show those who have not submitted
      if (!studentHasSubmitted) {
        semesterStudentsThatHaveNotSubmitted.push(student);
      }
    }
    return semesterStudentsThatHaveNotSubmitted;
  };

  const getTitleIfThereAreStudentsToBeAdded = () => {
    const students = semesterStudentsThatHaveNotSubmitted();
    if (students.length > 0) {
      return 'Seleccione un alumno para agregar a la entrega';
    }
    return 'No hay alumnos para agregar a la entrega';
  }

  return (
    <View style={styles.navButtonsContainer}>
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
      <EntitySelectionModal
        visible={modalVisible}
        entities={semesterStudentsThatHaveNotSubmitted()}
        onSelect={(student: any) => addStudentSubmission(student)}
        onClose={() => setModalVisible(false)}
        title={getTitleIfThereAreStudentsToBeAdded()}
      />
      {isActualUserChiefTeacher && (
        <>
          <TouchableOpacity style={styles.navButton} onPress={showConfirmNotifyStudents}>
            <MaterialIcon name="bell-ring" fontSize={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={showConfirmAutoAssignGraders}>
            <MaterialIcon name="auto-fix" fontSize={24} color="gray" />
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.navButton} onPress={showEvaluationQR}>
        <MaterialIcon name="qrcode" fontSize={24} color="gray" />
      </TouchableOpacity>
      {isActualUserChiefTeacher && (
        <TouchableOpacity style={styles.navButton} onPress={showEditEvaluation}>
            <MaterialIcon name="pencil-outline" fontSize={24} color="gray" />
          </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.navButton} onPress={() => setModalVisible(true)}>
        <MaterialIcon name="plus" fontSize={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navButtonsContainer: {
    flexDirection: 'row',
  },
  navButton: {
    marginRight: 15,
  },
});
