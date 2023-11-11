import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { EvaluationInstance } from '../models';
import { eventCard as style } from '../styles';
import moment from 'moment';

interface EventCardProps {
  event: EvaluationInstance;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <View style={style().view}>
      <Text style={style().name}>
        {event.type_name}
        <Text style={style().subjectName}>
          {` `}- {event.semester.commission.subject_name}
        </Text>
      </Text>

      <Text style={style().date}>
        {getRemainingTime(event.date)}
      </Text>
    </View>
  );
};

function getRemainingTime(targetDate: Date): string {
  const currentDate = moment();
  const futureDate = moment(targetDate);

  if (futureDate.isBefore(currentDate)) {
    return "Time has already passed";
  }

  return futureDate.fromNow();
}


export default EventCard;
