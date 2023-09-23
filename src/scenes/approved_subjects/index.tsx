import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { FinalExamList, FilterDescriptor } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { finalExamsRepository } from '../../repositories';
import { CorrelativeFilter } from './filters';
import { FinalExam } from '../../models';

interface ApprovedSubjectsProps {
  filter: any; // Replace with a more specific type if available
  navigation: any; // Replace with a more specific type if available
}

const ApprovedSubjects: React.FC<ApprovedSubjectsProps> = ({ filter: initialFilter, navigation }) => {
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const fetchExams = async (): Promise<FinalExam[]> => {
    try {
        if (filter && filter instanceof CorrelativeFilter) {
            const exams = await finalExamsRepository.fetchApprovedCorrelatives(filter.value);
            console.log('ApprovedSubjects: fetchExams: exams', exams);
            return exams
        } else if (filter) {
            const exams = await finalExamsRepository.fetchApproved(filter.type, filter.value);
            console.log('ApprovedSubjects: fetchExams: exams', exams);
            return exams
        } else {
            const exams = await finalExamsRepository.fetchApproved();
            console.log('ApprovedSubjects: fetchExams: exams', exams);
            return exams
        }
    } catch (error) {
        if (error instanceof finalExamsRepository.NotASubject) {
            Alert.alert(
                'No existe esa materia',
                'Chequeá bien el código y asegurate de escribirlo tal cual (con el punto inclusive).'
            );
            return [];
        } else {
            console.log('Error', error);
            throw error;
        }
    }
};


  return (
    <SafeAreaView style={style().view}>
      {filter && (
        <FilterDescriptor
          filter={filter}
          onClose={() => setFilter(null)}
        />
      )}
      <FinalExamList
        id=''
        key={`ApprovedSubjects-${filter ? filter.id() : ''}`}
        navigation={navigation}
        fetch={fetchExams}
        emptyMessage={`No tenés materias aprobadas aún.${'\n'}No te olvides de rendir los finales.`}
      />
    </SafeAreaView>
  );
};

export default ApprovedSubjects;
