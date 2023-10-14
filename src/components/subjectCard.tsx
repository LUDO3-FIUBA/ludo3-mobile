import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { Subject } from '../models';
import { finalExamCard as style } from '../styles';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: FC<SubjectCardProps> = ({ subject }) => {
  return (
    <View style={style().view}>
      <Text style={style().subjectName}>
        {subject.code} {subject.name}
      </Text>
      <Text style={style().professor}>
        {subject.professor}
      </Text>
    </View>
  );
};

export default SubjectCard;
