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

  const groupEvaluationsByParent = (submissions: any[], evaluations: any[]) => {
    const evaluationMap = new Map(evaluations.map((e: any) => [e.id, e]));
    const grouped: any[] = [];
    const processedIds = new Set<number>();

    submissions.forEach((submission: any) => {
      if (processedIds.has(submission.evaluationId)) return;

      const evaluation = evaluationMap.get(submission.evaluationId);
      if (!evaluation) return;

      processedIds.add(submission.evaluationId);

      if (!evaluation.parentEvaluation) {
        grouped.push({
          evaluation,
          submission,
          children: []
        });

        const childrenSubmissions = submissions.filter((s: any) => {
          const childEval = evaluationMap.get(s.evaluationId);
          return childEval && childEval.parentEvaluation === evaluation.id && !processedIds.has(s.evaluationId);
        });

        childrenSubmissions.forEach((childSub: any) => {
          const childEval = evaluationMap.get(childSub.evaluationId);
          grouped[grouped.length - 1].children.push({
            evaluation: childEval,
            submission: childSub
          });
          processedIds.add(childSub.evaluationId);
        });
      }
    });

    return grouped;
  };

  const renderGrade = (grade: number | null) => {
    if (grade === null) return 'Sin calificar';
    return String(grade);
  };

  const renderSubmissions = (submissions: any[]) => {
    const grouped = groupEvaluationsByParent(submissions, semesterData?.evaluations || []);

    return (
      <View style={styles.submissionsContainer}>
        {grouped.map((group: any, index: number) => (
          <View key={`${group.evaluation.id}-${index}`}>
            <View style={styles.evaluationRow}>
              <Text style={styles.evaluationName}>{group.evaluation.evaluationName}</Text>
              <Text style={styles.grade}>{renderGrade(group.submission.grade)}</Text>
            </View>
            {group.children.length > 0 && (
              <View style={styles.childrenContainer}>
                {group.children.map((child: any) => (
                  <View key={`${child.evaluation.id}`} style={styles.childEvaluationRow}>
                    <Text style={styles.childEvaluationName}>{child.evaluation.evaluationName}</Text>
                    <Text style={styles.grade}>{renderGrade(child.submission.grade)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
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
  evaluationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
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
