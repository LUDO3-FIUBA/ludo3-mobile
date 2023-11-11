import React, { FC } from 'react';
import { Evaluation } from '../models';
import EventCard from './eventCard';

// interface UpcomingEventsCardProps {
// }

const UpcomingEventsCard: FC = () => {
    const eventItems = getEventItems()

    return (
        eventItems.map(event => <EventCard key={`${event.id}`} event={event} />)
    );
};

function getEventItems(): Evaluation[] {
    return [
        { id: 1, evaluation_name: 'Trabajo Practico', end_date: "2023-11-26", passing_grade: 4, start_date: null },
        { id: 2, evaluation_name: 'Parcial', end_date: "2023-12-06", passing_grade: 4, start_date: null },
        { id: 3, evaluation_name: 'Final', end_date: "2023-12-26", passing_grade: 4, start_date: null },
    ]
}

export default UpcomingEventsCard;
