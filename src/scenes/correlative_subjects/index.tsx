import React from 'react';
import { SafeAreaView } from 'react-native';
import { SubjectList } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { subjectsRepository } from '../../repositories';
import { Subject } from '../../models';

interface CorrelativeSubjectsProps {
  navigation: any; // Replace with a more specific type if available
  route: any
}

const CorrelativeSubjects: React.FC<CorrelativeSubjectsProps> = ({ navigation, route }) => {
  const subject_id = route.params?.id;

  const fetchCorrelatives = async (): Promise<Subject[]> => {
    try {
      return await subjectsRepository.fetchCorrelatives(subject_id);
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={style().view}>
      <SubjectList
        filter={undefined}
        key={`CorrelativeSubjects-${subject_id}`}
        navigation={navigation}
        fetch={fetchCorrelatives}
        emptyMessage={`Esta materia no parece tener correlativas.`}
        disableOnPress={true}
      />
    </SafeAreaView>
  );
};

export default CorrelativeSubjects;
