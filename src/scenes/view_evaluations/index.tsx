import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SubjectList } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { evaluationsRepository } from '../../repositories';
import { Evaluation } from '../../models';
import EvaluationList from '../../components/evaluations/evaluationList';

interface ViewEvaluationsProps {
  route: any
}

const ViewEvaluations: React.FC<ViewEvaluationsProps> = ({ route }) => {
  const semester_id = route.params?.semester_id;
  const navigation = useNavigation();

  const fetchSemesterEvaluations = async (): Promise<Evaluation[]> => {
    try {
      return await evaluationsRepository.fetchSemesterEvaluations(semester_id);
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={style().view}>
      <EvaluationList
        key={`ViewEvaluations-${semester_id}`}
        fetch={fetchSemesterEvaluations}
        emptyMessage={`Esta comision no parece tener evaluaciones proximas.`}
      />
    </SafeAreaView>
  );
};

export default ViewEvaluations;
