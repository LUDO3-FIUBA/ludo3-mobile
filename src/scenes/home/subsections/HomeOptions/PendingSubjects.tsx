import React, { Component } from 'react';
import PendingSubjectsScreen from '../../../pending_subjects/index';

interface Props {
  navigation: any
}

export function PendingSubjects({ navigation }: Props) {
  return <PendingSubjectsScreen navigation={navigation} key="PendingSubjects"/>
}

export default PendingSubjects;
