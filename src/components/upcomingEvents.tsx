import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { upcomingEvents as style } from '../styles';
import BasicList from './basicList';
import EventCard from './eventCard';
import { ChiefTeacher, Commission, EvaluationInstance, Semester } from '../models';

// interface UpcomingEventsCardProps {
// }

const UpcomingEventsCard: FC = () => {
    const eventItems = getEventItems()

    return (
        eventItems.map(event => <EventCard key={`${event.id}`} event={event} />)
    );
};

function getEventItems(): EvaluationInstance[] {

    const chiefTeacher: ChiefTeacher = {
        first_name: "Juan Martin",
        last_name: "Sirne",
        dni: "41318038",
        email: "jsirne@fi.uba.ar",
        legajo: "101049"
    };

    const commission: Commission = {
        subject_siu_id: 1,
        subject_name: "Física I - Cátedra 3", // Updated subject name
        chief_teacher: chiefTeacher
    };

    const semester: Semester = {
        year_moment: "FS",
        start_date: new Date("2023-03-10T19:00:00-03:00"),
        commission
    };

    return [
        new EvaluationInstance(1, 'Trabajo Practico', new Date("2023-11-06"), semester),
        new EvaluationInstance(2, 'Parcial', new Date("2023-11-26"), semester),
        new EvaluationInstance(3, 'Final', new Date("2023-12-06"), semester)
    ]
}

export default UpcomingEventsCard;
