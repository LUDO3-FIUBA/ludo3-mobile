import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { Loading, RoundedButton } from '../../components';
import { evaluations as style } from '../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import EvaluationsListElement from './EvaluationsListElement';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { TeacherSemester } from '../../models/TeacherSemester';
import { makeRequest } from '../../networking/makeRequest';
import { teacherEvaluationsRepository } from '../../repositories';
import { EvaluationsListHeaderRight } from './EvaluationsListHeaderRight';
import { FontAwesome } from '@expo/vector-icons';

interface EvaluationsProps {
  // No specific props if not needed
}

interface EvaluationsRouteParams {
  semester: TeacherSemester;
  evaluations: TeacherEvaluation[];
}

const EvaluationsList: React.FC<EvaluationsProps> = () => {
  const route = useRoute();
  const semester: TeacherSemester = (route.params as EvaluationsRouteParams).semester;
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);

  const setNavOptions = useCallback(() => {
    navigation.setOptions({
      title: 'Evaluaciones',
      headerRight: () => <EvaluationsListHeaderRight />,
    });
  }, [navigation]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      setNavOptions();
    });
    return focusUnsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      const evaluationsData: TeacherEvaluation[] = await makeRequest(() => teacherEvaluationsRepository.fetchPresentSemesterEvaluations(semester.commission.id), navigation);
      setEvaluations(evaluationsData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('Error', error);
      Alert.alert(
        '¿Qué pasó?',
        'No sabemos pero no pudimos buscar tus evaluaciones. ' +
        'Volvé a intentar en unos minutos.',
      );
    }
  };

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return () => focusUnsubscribe();
  }, [navigation, fetchData]);

  return (
    <View style={{ flex: 1, height: '100%' }}>
      {loading && <Loading />}
      {!loading && (
        <FlatList
          style={{ flex: 1, height: '100%' }}
          contentContainerStyle={evaluations.length === 0
            ? { flexGrow: 1, backgroundColor: 'white' }
            : { marginTop: 5 }}
          data={evaluations}
          keyExtractor={evaluation => evaluation.id.toString()}
          ListEmptyComponent={() => (
            <View style={style().emptyEvaluationsContainer}>
              <FontAwesome name="folder-open" size={50} color="#6c757d" style={style().emptyEvaluationsIcon} />
              <Text style={style().emptyEvaluationsText}>No hay evaluaciones registradas por el momento</Text>
              <Text style={style().emptyEvaluationsSecondText}>Podés agregar una pulsando el '+' en la esquina superior derecha</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SubmissionsList', {
                  evaluation: item,
                });
              }}
            >
              <EvaluationsListElement evaluation={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default EvaluationsList;
