import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Loading, MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';
import { evaluationsRepository } from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';
import { EvaluationSubmission } from '../../models';

interface SubmissionWithEvaluation extends EvaluationSubmission {
  evaluationName: string;
}

type SubmissionResult = 'PASSED' | 'FAILED' | 'PENDING';

const MySubmissionsScreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionWithEvaluation[]>([]);

  const semesterId = route?.params?.semesterId;

  useEffect(() => {
    navigation.setOptions({
      title: 'Mis entregas',
    });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!semesterId) {
        if (isMounted) {
          setSubmissions([]);
          setLoading(false);
        }
        return;
      }

      try {
        const allSubmissions = await makeRequest(
          () => evaluationsRepository.fetchMySubmissions(semesterId.toString()),
          navigation
        );

        if (isMounted) {
          const getCreatedAtTime = (submission: EvaluationSubmission) => new Date(submission.created_at).getTime();
          const sortedSubmissions = [...allSubmissions].sort(
            (a, b) => getCreatedAtTime(a) - getCreatedAtTime(b),
          );
          setSubmissions(sortedSubmissions);
        }
      } catch (error) {
        console.log('Error obteniendo entregas', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigation, semesterId]);

  const getSubmissionResult = (submission: SubmissionWithEvaluation): SubmissionResult => {
    const evaluation = submission.evaluation as (EvaluationSubmission['evaluation'] & { is_graded?: boolean }) | undefined;
    const isGradeable = evaluation?.is_gradeable;
    const passingGrade = evaluation?.passing_grade;

    if (isGradeable && passingGrade !== null && passingGrade !== undefined) {
      if (submission.grade === null || submission.grade === undefined) {
        return 'PENDING';
      }

      return submission.grade >= passingGrade ? 'PASSED' : 'FAILED';
    }

    if (submission.submission_status === 'APROBADO') return 'PASSED';
    if (submission.submission_status === 'DESAPROBADO') return 'FAILED';

    if (evaluation?.is_graded === false) return 'PENDING';

    return 'PENDING';
  };

  const getStatusColor = (result: SubmissionResult) => {
    if (result === 'PASSED') return '#28a745';
    if (result === 'FAILED') return '#dc3545';
    return '#6c757d';
  };

  const getStatusIcon = (result: SubmissionResult) => {
    if (result === 'PASSED') return 'check-circle';
    if (result === 'FAILED') return 'close-circle';
    return 'clock-outline';
  };

  const getStatusLabel = (result: SubmissionResult) => {
    if (result === 'PASSED') return 'Aprobado';
    if (result === 'FAILED') return 'Desaprobado';
    return 'Sin calificar';
  };

  const renderSubmission = ({ item }: { item: SubmissionWithEvaluation }) => {
    const result = getSubmissionResult(item);

    return (
    <View
      style={[
        styles.sessionContainer,
        result === 'FAILED' && styles.rejectedContainer,
      ]}
    >
      <View style={styles.headerRow}>
        <MaterialIcon
          name="file-document"
          fontSize={24}
          color={getStatusColor(result)}
        />
        <Text style={styles.sessionHeader}>{item.evaluation?.evaluation_name ?? 'Entrega'}</Text>
        <View style={styles.statusIconContainer}>
          <MaterialIcon
            name={getStatusIcon(result)}
            fontSize={24}
            color={getStatusColor(result)}
          />
        </View>
      </View>
      <Text style={styles.dateText}>
        Fecha de entrega: {moment(new Date(item.created_at)).format('DD/MM/YYYY HH:mm')}
      </Text>
      {item.grade !== undefined && item.grade !== null && (
        <Text style={styles.gradeText}>Calificación: {item.grade}</Text>
      )}
      <Text
        style={[
          styles.statusText,
          result === 'FAILED' && styles.desaprobadoText,
          result === 'PASSED' && styles.aprobadoText,
          result === 'PENDING' && styles.pendingText,
        ]}
      >
        {getStatusLabel(result)}
      </Text>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmission}
          keyExtractor={(item, index) => `${item.evaluation?.id}-${index}`}
          ListEmptyComponent={() => (
            <Text style={styles.noDataText}>No hay entregas para este cuatrimestre</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  sessionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rejectedContainer: {
    borderColor: '#dc3545',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  statusIconContainer: {
    marginLeft: 'auto',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  gradeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  aprobadoText: {
    color: '#28a745',
  },
  desaprobadoText: {
    color: '#dc3545',
  },
  pendingText: {
    color: '#6c757d',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default MySubmissionsScreen;
