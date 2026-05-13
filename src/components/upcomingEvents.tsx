import React, { FC } from 'react';
import { Evaluation } from '../models';
import EventCard from './eventCard';
import { View, Text } from 'react-native';
import { finalExamList as style } from '../styles';

interface Props {
    evaluations: Evaluation[]
}

const UpcomingEventsCard: FC<Props> = ({ evaluations }: Props) => {
    return (
        <View>
            {!evaluations.length && (
                <View style={style().textContainer}>
                    <Text style={style().emptyMessageText}>No tenés eventos próximamente.</Text>
                </View>
            )}    
            {evaluations.map(
                evaluation => <EventCard key={`${evaluation.id}`} evaluation={evaluation} />)
            }
        </View>
    );
};

export default UpcomingEventsCard;
