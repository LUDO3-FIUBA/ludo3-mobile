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

  const request = async (callback: () => Promise<any>) => {
    // if there's any logic inside the request method of AuthenticatedComponent, 
    // you should reproduce it here or extract it to a custom hook or helper function
    return callback();
  };

  const filter = useAppSelector(selectActualFilter)

  return (
    <SafeAreaView style={style().view}>
      <FinalExamList
        filter={filter}
        key="Materias pendientes de final"
        navigation={navigation}
        fetch={() => request(() => finalExamsRepository.fetchPending())}
        emptyMessage={`No tenés materias en instancia de final.${'\n\n'}`} 
        />
    </SafeAreaView>
  );
};

export default PendingSubjects;
