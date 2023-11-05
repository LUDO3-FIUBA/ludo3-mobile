import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { upcomingEvents as style } from '../styles';
import BasicList from './basicList';
import EventCard from './eventCard';
import EvaluationInstance, { ChiefTeacher, Commission, Semester } from '../models/EvaluationInstance';

// interface UpcomingEventsCardProps {
// }

const UpcomingEventsCard: FC = () => {
    const eventItems = getEventItems()

    return (
        eventItems.map(event => <EventCard key={`${event.id}`} event={event} />)
    );
};

function getEventItems(): EvaluationInstance[] {

    const chiefTeacher = new ChiefTeacher(
        "Juan Martin",
        "Sirne",
        "41318038",
        "jsirne@fi.uba.ar",
        "101049"
    );

    const commission = new Commission(
        1,
        "Física I - Cátedra 3", // Updated subject name
        chiefTeacher
    );

    const semester = new Semester(
        "FS",
        "2023-03-10T19:00:00-03:00",
        commission
    );

    return [
        new EvaluationInstance(1, 'Trabajo Practico', new Date("2023-11-06"), semester),
        new EvaluationInstance(2, 'Parcial', new Date("2023-11-26"), semester),
        new EvaluationInstance(3, 'Final', new Date("2023-12-06"), semester)
    ]
}

export default UpcomingEventsCard;
