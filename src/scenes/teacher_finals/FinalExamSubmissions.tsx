import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TextInput, ToastAndroid } from 'react-native';
import { Loading } from '../../components';
import { teacherFinalsRepository } from '../../repositories';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TeacherFinal } from '../../models/TeacherFinal';
import { TeacherFinalExam } from '../../models/TeacherFinalExam';
import { FinalExamSubmissionsHeaderRight } from './FinalExamSubmissionsHeaderRight';
import { useAppSelector } from '../../redux/hooks';
import { selectUserData } from '../../redux/reducers/teacherUserDataSlice';
import FinalExamSubmissionsListFooter from './FinalExamSubmissionsListFooter';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { MaterialIcon } from '../../components';
import { FinalStatus } from '../../models/FinalStatus';

interface FinalExamSubmissionsRouteParams {
  final: TeacherFinal;
}

const FinalExamSubmissions: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const final = (route.params as FinalExamSubmissionsRouteParams).final;
  const [loading, setLoading] = useState<boolean>(false);
  const [finalExams, setFinalExams] = useState<TeacherFinalExam[]>([]);
  const [editingGrade, setEditingGrade] = useState<number | null>(null);
  const [gradeText, setGradeText] = useState<string>('');

  const userData = useAppSelector(selectUserData);
  const semesterData = useAppSelector(selectSemesterData);

  const fetchData = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const finalData = await teacherFinalsRepository.getDetail(final.id);
      setFinalExams(finalData.finalExams.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName)));
    } catch (error) {
      Alert.alert(
        '¿Qué pasó?',
        'No sabemos pero no pudimos buscar los exámenes. Volvé a intentar en unos minutos.',
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [final.id, loading, navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  const setNavOptions = useCallback(() => {
    navigation.setOptions({
      title: 'Entregas del final',
      headerRight: () => final.status === FinalStatus.Grading ? <FinalExamSubmissionsHeaderRight final={final} fetchData={fetchData} /> : null,
    });
  }, [navigation, fetchData, final]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return focusUnsubscribe;
  }, [navigation, fetchData]);

  useEffect(() => {
    setNavOptions();
  }, [setNavOptions]);

  const updateFinalExamGrade = async (exam: TeacherFinalExam, newGrade: string) => {
    const grade = Number(newGrade);

    if (newGrade === '') {
      return;
    }

    if (isNaN(grade) || grade < 1 || grade > 10) {
      Alert.alert('Error', 'La nota debe ser un número entre 1 y 10.');
      return;
    }

    try {
      const response = await teacherFinalsRepository.grade(final.id, [{ finalExamSubmissionId: exam.id, grade }]);
      ToastAndroid.show(`La calificación de ${exam.student.firstName} ${exam.student.lastName} ha sido guardada exitosamente`, ToastAndroid.LONG);
      console.log("Response after grading", response);

      fetchData();
    } catch (error) {
      Alert.alert("Error", "Hubo un error al guardar la calificación");
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Estudiante</Text>
      <Text style={styles.headerText}>Nota</Text>
    </View>
  );

  const editingCondition = (): boolean => {
    if (final.status === FinalStatus.Closed) return false;
    else return final.teacher === userData?.id;
  };

  const handleEditGrade = (exam: TeacherFinalExam) => {
    if (editingCondition()) {
      setEditingGrade(exam.student.id);
      setGradeText(exam.grade?.toString() || '');
    }
  };

  const handleBlur = (exam: TeacherFinalExam) => {
    updateFinalExamGrade(exam, gradeText);
    setEditingGrade(null);
  };

  const renderItem = ({ item: exam }: { item: TeacherFinalExam }) => {
    const isEditable = editingCondition();
    return (
      <View style={[styles.row, !isEditable && styles.nonEditableRow]}>
        <Text style={styles.cell}>{`${exam.student.firstName} ${exam.student.lastName}`}</Text>
        <View style={styles.divider} />
        {editingGrade === exam.student.id ? (
          <TextInput
            style={styles.input}
            value={gradeText}
            onChangeText={setGradeText}
            onBlur={() => handleBlur(exam)}
            keyboardType="numeric"
            autoFocus
          />
        ) : (
          <Text
            style={[styles.cell, isEditable && styles.editableCell]}
            onPress={() => handleEditGrade(exam)}
          >
            {exam.grade?.toString() || ''}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <MaterialIcon name="face-man" fontSize={30} color="gray" style={styles.emptyIcon} />
        <MaterialIcon name="face-woman" fontSize={30} color="gray" style={styles.emptyIcon} />
      </View>
      <Text style={styles.emptyText}>Aún no hay entregas para este final.</Text>
      <Text style={styles.emptySubText}>Podés agregar manualmente una entrega usando el botón localizado en la esquina superior derecha.</Text>
    </View>
  );

  return (
    <View style={styles.view}>
      {loading && <Loading />}
      {renderHeader()}
      <FlatList
        data={finalExams}
        keyExtractor={(exam) => exam.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={<FinalExamSubmissionsListFooter canCloseAct={canCloseAct(finalExams)} final={final} />}
      />
    </View>
  );
};

function canCloseAct(finalExams: TeacherFinalExam[]) {
  return finalExams.reduce((canUntilNow, exam) => canUntilNow && exam.grade != null, true);
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#e0e0e0',
  },
  cell: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  editableCell: {
    // textDecorationLine: 'underline',
    // color: 'blue',
  },
  divider: {
    height: '100%',
    width: 1,
    backgroundColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
});

export default FinalExamSubmissions;
