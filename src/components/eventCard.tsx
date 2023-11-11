import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { Evaluation } from '../models';
import { eventCard as style } from '../styles';
import moment from 'moment';

interface EventCardProps {
  event: Evaluation;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <View style={style().view}>
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
