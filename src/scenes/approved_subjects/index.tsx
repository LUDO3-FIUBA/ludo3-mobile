import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { FinalExamList, FilterDescriptor } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { finalExamsRepository } from '../../repositories';
import { FinalExam } from '../../models';
import { FiltersEnum } from './FiltersEnum';
import { Filter } from './IFilter';
import { useAppSelector } from '../../redux/hooks';
import { selectActualFilter } from '../../redux/reducers/filterSlice';

interface ApprovedSubjectsProps {
  navigation: any; // Replace with a more specific type if available
}

const ApprovedSubjects: React.FC<ApprovedSubjectsProps> = ({ navigation }) => {
  const filter = useAppSelector(selectActualFilter)

  useEffect(() => {
    console.log("Filter changed");
  }, [filter])
  

  const fetchExams = async (): Promise<FinalExam[]> => {
    try {
      switch (filter.type) {
        // Fetch approved correlatives for a given subject
        case FiltersEnum.Correlative:
          console.log("Find correlatives for: ", filter.value);
          return await finalExamsRepository.fetchApprovedCorrelatives(filter.value);

        // Fetch approved subjects for a given year
        case FiltersEnum.Year:
          console.log("Filter selected: ", filter);
          return await finalExamsRepository.fetchApproved(filter.type, filter.value);

        // Fetch approved subjects for a given subject name
        case FiltersEnum.Name:
          console.log("Filter selected: ", filter);
          return await finalExamsRepository.fetchApproved(filter.type, filter.value);

        // Return all approved subjects when no filter selected
        case FiltersEnum.None:
          console.log("No filter selected");
          return await finalExamsRepository.fetchApproved();
          
        default:
          throw new Error('Unknown filter type');
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
          onClose={() => setFilter({ type: FiltersEnum.None, title: '', id: '', value: '' })}
        />
      )}
      <FinalExamList
        id=''
        key={`ApprovedSubjects-${filter ? filter.id : ''}`}
        navigation={navigation}
        fetch={fetchExams}
        emptyMessage={`No tenés materias aprobadas aún.${'\n'}No te olvides de rendir los finales.`}
      />
    </SafeAreaView>
  );
};

export default ApprovedSubjects;
