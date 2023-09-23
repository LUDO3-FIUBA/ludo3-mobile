import React, { Component } from 'react';
import PendingSubjectsScreen from '../../../pending_subjects/index';

interface Props {
  navigation: any
}

export function PendingSubjects({ navigation }: Props) {
  const initialProps = {}
  return <PendingSubjectsScreen navigation={navigation} key="PendingSubjects" {...initialProps}/>
}

export default PendingSubjects;
