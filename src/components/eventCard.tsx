import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Evaluation } from '../models';
import { eventCard as style } from '../styles';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

interface EventCardProps {
  evaluation: Evaluation;
}

const EventCard: FC<EventCardProps> = ({ evaluation }) => {
  const navigation = useNavigation()
  return (
    <View style={style().view}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewEvaluationDetails', { evaluation })}
        style={{ padding: 12 }}
      >
        <Text style={style().name}>
          {evaluation.evaluation_name}
          <Text style={style().subjectName}>
            {` `}- {evaluation.semester.commission.subject_name}
          </Text>
        </Text>

        <Text style={style().date}>
          {getRemainingTime(evaluation.start_date, evaluation.end_date)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

function getRemainingTime(startDateStr: string | null, endDateStr: string): string {
  const currentDate = moment();
  const startDate = moment(startDateStr || endDateStr);
  const endDate = moment(endDateStr);

  if (endDate.isBefore(currentDate)) {
    return "Este evento ya ocurrió";
  }

  if (currentDate.isBetween(startDate, endDate)) {
    return "Ahora";
  }

  return startDate.fromNow();
}


export default EventCard;
