import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { upcomingEvents as style } from '../styles';
import BasicList from './basicList';
import EventCard from './eventCard';

// interface UpcomingEventsCardProps {
// }

const UpcomingEventsCard: FC = () => {
    const eventItems = [
        { name: 'Parcial', subject_name: 'Fisica II', onPress: () => { }, date: new Date() },
        { name: 'Trabajo Practico', subject_name: 'Quimica', onPress: () => { }, date: new Date() },
        { name: 'Final', subject_name: 'Algoritmos y Programacion II', onPress: () => { }, date: new Date() }
    ]

    return (
        eventItems.map(event => <EventCard event={event} />)
    );
};

export default UpcomingEventsCard;
