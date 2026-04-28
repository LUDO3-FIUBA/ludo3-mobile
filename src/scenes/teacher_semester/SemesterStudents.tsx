import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { TeacherStudent } from '../../models/TeacherStudent';
import { useNavigation } from '@react-navigation/native';
import { SemesterStudentsHeaderRight } from './SemesterStudentsHeaderRight';
import { MaterialIcon } from '../../components';
const UserIcon = require('./img/usericon.jpg');

const SemesterStudents: React.FC = () => {
  const semesterData = useAppSelector((state) => state.teacherSemester.data);
  const students = semesterData?.students as TeacherStudent[];
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  const navigation = useNavigation()

  const setNavOptions = useCallback(() => {
    navigation.setOptions({
      title: 'Alumnos del cuatrimestre',
      headerRight: () => <SemesterStudentsHeaderRight />,
    });
  }, [navigation]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      setNavOptions();
    });
    return focusUnsubscribe;
  }, [])

  const calculateAttendancePercentage = (attendancesCount: number | undefined): number => {
    if (!attendancesCount) attendancesCount = 0;
    if (!semesterData?.attendanceQrsCount || semesterData.attendanceQrsCount === 0) {
      return 0;
    }
    return Math.round((attendancesCount / semesterData.attendanceQrsCount) * 100);
  };

  const getSubmissionLabel = (submission: any) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return String(submission.grade);
    }

    if (submission.submissionStatus) {
      return submission.submissionStatus.charAt(0).toUpperCase() + submission.submissionStatus.slice(1).toLowerCase();
    }

    return 'Sin calificar';
  };

  const getSubmissionTone = (submission: any, evaluation: any) => {
    if (submission.submissionStatus === 'DESAPROBADO') {
      return 'Desaprobado';
    }

    if (submission.submissionStatus === 'APROBADO') {
      return 'Aprobado';
    }

    if (submission.grade !== null && submission.grade !== undefined && evaluation?.passingGrade !== null && evaluation?.passingGrade !== undefined) {
      return submission.grade >= evaluation.passingGrade ? 'Aprobado' : 'Desaprobado';
    }

    return 'Sin calificar';
  };

  const renderSubmissionRow = (evaluation: any, submission: any, isChild: boolean, indentLevel: number) => {
    const tone = getSubmissionTone(submission, evaluation);
    const rowStyle = [
      isChild ? styles.childEvaluationRow : styles.evaluationRow,
      tone === 'Aprobado' && styles.submissionGood,
      tone === 'Desaprobado' && styles.submissionBad,
      tone === 'Sin calificar' && styles.submissionNeutral,
      isChild && { marginLeft: indentLevel * 12 },
    ];

    return (
      <View style={rowStyle}>
        <Text style={[isChild ? styles.childEvaluationName : styles.evaluationName, tone === 'Aprobado' && styles.submissionTextGood, tone === 'Desaprobado' && styles.submissionTextBad]}>
          {evaluation.evaluationName}
        </Text>
        <Text style={[styles.grade, tone === 'Aprobado' && styles.submissionTextGood, tone === 'Desaprobado' && styles.submissionTextBad]}>
          {getSubmissionLabel(submission)}
        </Text>
      </View>
    );
  };

  const renderEvaluationTree = (evaluation: any, submissionMap: Map<number, any>, indentLevel: number = 0): React.ReactNode => {
    const children = (semesterData?.evaluations || []).filter((childEvaluation: any) => childEvaluation.parentEvaluation === evaluation.id);
    const submission = submissionMap.get(evaluation.id);
    const renderedChildren = children
      .map((childEvaluation: any) => renderEvaluationTree(childEvaluation, submissionMap, indentLevel + 1))
      .filter(Boolean);

    if (!submission && renderedChildren.length === 0) {
      return null;
    }

    return (
      <View key={evaluation.id}>
        {submission && renderSubmissionRow(evaluation, submission, indentLevel > 0, indentLevel)}
        {!submission && indentLevel === 0 && renderedChildren.length > 0 && (
          <View style={styles.evaluationRow}>
            <Text style={styles.evaluationName}>{evaluation.evaluationName}</Text>
            <Text style={styles.grade}>-</Text>
          </View>
        )}
        {renderedChildren.length > 0 && <View style={styles.childrenContainer}>{renderedChildren}</View>}
      </View>
    );
  };

  const renderSubmissions = (submissions: any[]) => {
    const submissionMap = new Map(submissions.map((submission: any) => [submission.evaluationId, submission]));
    const rootEvaluations = (semesterData?.evaluations || []).filter((evaluation: any) => !evaluation.parentEvaluation);

    return (
      <View style={styles.submissionsContainer}>
        {rootEvaluations.map((evaluation: any) => renderEvaluationTree(evaluation, submissionMap))}
      </View>
    );
  };

  const renderStudent = ({ item }: { item: TeacherStudent }) => {
    const isExpanded = expandedStudentId === item.id;
    const attendancePercentage = calculateAttendancePercentage(item.attendancesCount);

    return (
      <TouchableOpacity
        onPress={() => setExpandedStudentId(isExpanded ? null : item.id)}
        style={styles.studentCard}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Image source={UserIcon} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.studentDetail}>Padrón: {item.padron || 'Padrón faltante'}</Text>
          </View>
          <View style={styles.attendanceColumn}>
            <Text style={styles.attendanceLabel}>Asistencia</Text>
            <Text style={styles.attendancePercentage}>{attendancePercentage}%</Text>
          </View>
          <MaterialIcon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            fontSize={24}
            color="gray"
          />
        </View>
        {isExpanded && item.submissions && item.submissions.length > 0 && (
          renderSubmissions(item.submissions)
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alumnos ({students?.length || 0})</Text>
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  studentCard: {
    padding: 0,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    gap: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 13,
    color: 'grey',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  attendanceColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  attendanceLabel: {
    fontSize: 12,
    color: 'grey',
    fontWeight: '500',
    marginBottom: 4,
  },
  attendancePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  submissionsContainer: {
    marginTop: 0,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  evaluationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  submissionGood: {
    borderLeftColor: '#1b8f3a',
    backgroundColor: '#f1fbf4',
  },
  submissionBad: {
    borderLeftColor: '#c0392b',
    backgroundColor: '#fff4f4',
  },
  submissionNeutral: {
    borderLeftColor: '#9aa0a6',
  },
  evaluationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  submissionTextGood: {
    color: '#1b8f3a',
  },
  submissionTextBad: {
    color: '#c0392b',
  },
  childEvaluationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#ccc',
    marginBottom: 4,
    marginLeft: 8,
  },
  childEvaluationName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  childrenContainer: {
    marginTop: 4,
  },
  grade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default SemesterStudents;
