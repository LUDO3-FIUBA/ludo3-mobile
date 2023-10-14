import React from 'react';
import AuthenticatedComponent from '../authenticatedComponent';
import { SafeAreaView } from 'react-native';
import { FinalExamList } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { finalExamsRepository } from '../../repositories';
import { useAppSelector } from '../../redux/hooks';
import { selectActualFilter } from '../../redux/reducers/filterSlice';

interface PendingSubjectsProps {
  navigation: any; // you might want to use a more specific type depending on your navigation setup
}

export function PendingSubjects({ navigation }: PendingSubjectsProps) {

  const filter = useAppSelector(selectActualFilter)

  return (
    <SafeAreaView style={style().view}>
      <FinalExamList
        filter={filter}
        key="Materias pendientes de final"
        navigation={navigation}
        fetch={() => finalExamsRepository.fetchPending()}
        emptyMessage={`No tenés materias en instancia de final.${'\n\n'}`} 
        />
    </SafeAreaView>
  );
};

export default PendingSubjects;
