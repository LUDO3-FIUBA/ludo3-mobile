import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { Submission } from '../../models/Submission';
import { teacherSubmissionsRepository } from '../../repositories';
import { useNavigation } from '@react-navigation/native';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { SubmissionsHeaderRight } from './SubmissionsHeaderRight';
import { Loading } from '../../components';
import { TeacherStudent } from '../../models/TeacherStudent';
import { TeacherModel } from '../../models/TeacherModel';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { TeacherTuple } from '../../models/TeacherTuple';
import EntitySelectionModal from './EntitySelectionModal';
import { selectStaffTeachers } from '../../redux/reducers/teacherStaffSlice';
import { selectUserData } from '../../redux/reducers/teacherUserDataSlice';
import EditableText from '../../components/EditableText';
import { MaterialIcon } from '../../components';

interface Props {
  route: any;
}

interface RouteParams {
  evaluation: TeacherEvaluation;
}


export default function SubmissionsList({ route }: Props) {
  const navigation = useNavigation();
  const semester = useAppSelector(selectSemesterData);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [semesterTeachers, setSemesterTeachers] = useState<TeacherModel[]>([]);
  const [showTeacherSelectionModal, setShowTeacherSelectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);

  const { evaluation } = route.params as RouteParams;

  const teachersTuples: TeacherTuple[] = useAppSelector(selectStaffTeachers);
  const userData = useAppSelector(selectUserData);

  const isActualUserChiefTeacher = semester?.commission.chiefTeacher.id === userData?.id;

  const fetchData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let submissions: Submission[] = await teacherSubmissionsRepository.getSubmissions(evaluation.id);
      submissions = submissions.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));

      if (semester) {
        // Getting only teachers
        const commissionTeachers = teachersTuples.map(actual => actual.teacher);
        // Add chief teacher
        commissionTeachers.push(semester.commission.chiefTeacher);
        // Set state
        setSemesterTeachers(commissionTeachers);
      }

      setSubmissions(submissions);
    } catch (error) {
      Alert.alert('Error', 'No pudimos conseguir información. Intenta nuevamente.');
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  }, [evaluation.id, isLoading]);

  const setNavOptions = useCallback(() => {
    navigation.setOptions({
      title: 'Entregas', // Set the screen title
      headerRight: () => (
        <SubmissionsHeaderRight
          evaluation={evaluation}
          fetchData={fetchData}
          submissions={submissions}
          isActualUserChiefTeacher={isActualUserChiefTeacher}
        />
      ),
    });
  }, [navigation, evaluation, fetchData, submissions, isActualUserChiefTeacher]);

  const updateCorrectorToSubmission = (submission: Submission) => {
    if (submission.grade) {
      Alert.alert('Error', 'No se puede cambiar el corrector de una entrega ya calificada.');
      return;
    } else if (isActualUserChiefTeacher) {
      setSelectedStudent(submission.student);
      setShowTeacherSelectionModal(true);
    } else {
      // You should never get here
      Alert.alert('Error', 'No tiene permisos para cambiar el corrector de esta entrega.');
    }
  };

  const assignCorrectorToStudent = async (student: TeacherStudent, newCorrector: TeacherModel) => {
    setShowTeacherSelectionModal(false);
    setSelectedStudent(null);

    try {
      await teacherSubmissionsRepository.assignGraderToSubmission(student.id, evaluation.id, newCorrector.id);
      // force-refresh
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Hubo un error al agregar el corrector");
    }
  };

  const updateSubmissionGrade = async (student: TeacherStudent, newGrade: string) => {
    const res = await teacherSubmissionsRepository.gradeSubmission(student.id, evaluation.id, +newGrade);
    ToastAndroid.show(`La calificación de ${student.firstName} ${student.lastName} ha sido guardada exitosamente`, ToastAndroid.LONG);
    setSubmissions(prevSubmissions =>
      prevSubmissions.map(submission =>
        submission.student.id === student.id
          ? { ...submission, grade: newGrade, grader: res.grader }
          : submission
      )
    );
  };

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return focusUnsubscribe;
  }, [navigation, fetchData]);

  useEffect(() => {
    setNavOptions();
  }, [setNavOptions]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Estudiante</Text>
      <Text style={styles.headerText}>Corrector</Text>
      <Text style={styles.headerText}>Nota</Text>
    </View>
  );

  const editingCondition = (submission: Submission): boolean => {
    return isActualUserChiefTeacher || submission.grader?.id === userData?.id || !submission.grader;
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={{ display: 'flex', flexDirection: 'row'}}>
        <MaterialIcon name="face-man" fontSize={30} color="gray" style={styles.emptyIcon} />
        <MaterialIcon name="face-woman" fontSize={30} color="gray" style={styles.emptyIcon} />
      </View>
      <Text style={styles.emptyText}>Aún no hay entregas para esta evaluación.</Text>
      <Text style={styles.emptySubText}>Podés agregar entregas manualmente o compartir </Text>
      <Text style={styles.emptySubText}> el QR con tus alumnos localizado en </Text>
      <Text style={styles.emptySubText}> la esquina superior derecha.</Text>
    </View>
  );

  return (
    <View style={styles.view}>
      {isLoading && <Loading />}
      {!isLoading && (
        <FlatList
          data={submissions}
          keyExtractor={submission => submission.student.dni}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: submission }) => {
            const isEditable = editingCondition(submission);
            return (
              <View style={[styles.row, !isEditable && styles.nonEditableRow]}>
                <Text style={styles.cell}>{`${submission.student.firstName} ${submission.student.lastName}`}</Text>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.cell}
                  disabled={!isActualUserChiefTeacher}
                  onPress={() => updateCorrectorToSubmission(submission)}
                >
                  <Text style={styles.text}>{submission.grader?.lastName}</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <EditableText
                  value={submission.grade || ''}
                  onChange={text => updateSubmissionGrade(submission.student, text)}
                  editable={isEditable}
                />
              </View>
            );
          }}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
      <EntitySelectionModal
        visible={showTeacherSelectionModal}
        entities={semesterTeachers}
        onSelect={(selectedTeacher: any) => {
          if (selectedStudent) {
            assignCorrectorToStudent(selectedStudent, selectedTeacher);
          }
        }}
        onClose={() => setShowTeacherSelectionModal(false)}
        title="Asignar corrector"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  containerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    gap: 18
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'space-around',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  nonEditableRow: {
    backgroundColor: '#e0e0e0', // Light gray color for non-editable rows
  },
  cell: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  divider: {
    height: '100%',
    width: 1,
    backgroundColor: '#ccc',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
    textAlign: 'center',
    backgroundColor: '#fff', // Make the input visible
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    marginHorizontal: 5,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
