import React, { FC } from 'react';
import ApprovedSubjectsScreen from '../../../approved_subjects';
import { YearFilter } from '../../../approved_subjects/filters';

interface Props {
  navigation: any
}

export function ApprovedSubjects({ navigation }: Props) {
  const intialFilter = null;
  return <ApprovedSubjectsScreen navigation={navigation} filter={intialFilter}/>
}

export default ApprovedSubjects;
