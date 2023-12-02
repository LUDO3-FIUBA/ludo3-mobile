import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Evaluation } from '../models';
import { eventCard as style } from '../styles';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

interface EventCardProps {
  event: Evaluation;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  const navigation = useNavigation()
  return (
    <View style={style().view}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewEvaluationDetails', { evaluation: event })}
        style={{ padding: 12 }}
      >
        <Text style={style().name}>
          {event.evaluation_name}
          <Text style={style().subjectName}>
            {` `}- NombreDeMateria
            {/* TODO: re-add Semester info here */}
          </Text>
        </Text>

        <Text style={style().date}>
          {getRemainingTime(event.end_date)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

function getRemainingTime(targetDate: string): string {
  const currentDate = moment();
  const futureDate = moment(targetDate);

  if (futureDate.isBefore(currentDate)) {
    return "Este evento ya ocurrió";
  }

  return futureDate.fromNow();
}


export default EventCard;
