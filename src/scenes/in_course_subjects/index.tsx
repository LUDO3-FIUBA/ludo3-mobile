import React from 'react';
import { SafeAreaView } from 'react-native';
import { SubjectList } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { subjectsRepository } from '../../repositories';
import { useAppSelector } from '../../redux/hooks';
import { selectActualFilter } from '../../redux/reducers/filterSlice';

interface InCourseSubjectsProps {
  navigation: any;
}

export function InCourseSubjects({ navigation }: InCourseSubjectsProps) {

  // const filter = useAppSelector(selectActualFilter)

  return (
    <SafeAreaView style={style().view}>
      <SubjectList
        // filter={filter}
        key="Materias en curso"
        navigation={navigation}
        fetch={() => subjectsRepository.fetchInCourse()}
        emptyMessage={`No tenés materias en instancia de final.${'\n\n'}`} 
        />
    </SafeAreaView>
  );
};

export default InCourseSubjects;
