import React, { FC } from 'react';
import ApprovedSubjectsScreen from '../../../approved_subjects';

interface Props {
  navigation: any
}

export function ApprovedSubjects({ navigation }: Props) {
  return <ApprovedSubjectsScreen navigation={navigation}/>
}

export default ApprovedSubjects;
