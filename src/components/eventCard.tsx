import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { Subject } from '../models';
import { eventCard as style } from '../styles';

interface EventCardProps {
  event: { name: string, subject_name: string, date: Date };
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <View style={style().view}>
      <Text style={style().name}>
        {event.name}
        <Text style={style().subjectName}>
          {` `}- {event.subject_name}
        </Text>
      </Text>

      <Text style={style().date}>
        {event.date.toLocaleString()}
      </Text>
    </View>
  );
};

export default EventCard;
