import React, { FC } from 'react';
import { View, Text } from 'react-native';
import FinalExamCard from './finalExamCard';
import { finalExamList as style } from '../styles';
import { FinalExam } from '../models';

interface FinalExamOverviewListProps {
  finalExams: FinalExam[];
  emptyMessage: string;
}

const FinalExamOverviewList: FC<FinalExamOverviewListProps> = ({ finalExams, emptyMessage }) => {
  if (!finalExams.length) {
    return (
      <View style={style().view}>
        <Text style={style().emptyMessageText}>{emptyMessage}</Text>
      </View>
    )
  }

  return (
    <View style={style().view}>
      {finalExams.map((item) =>
        <FinalExamCard key={`finalexamsoverview-${item.id}`} finalExam={item} />
      )}
    </View>
  );
};

export default FinalExamOverviewList;
