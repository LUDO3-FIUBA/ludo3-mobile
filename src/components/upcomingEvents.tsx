import React, { FC } from 'react';
import { Evaluation } from '../models';
import EventCard from './eventCard';

interface Props {
    evaluations: Evaluation[]
}

const UpcomingEventsCard: FC<Props> = ({ evaluations }: Props) => {
    return (
        evaluations.map(evaluation => <EventCard key={`${evaluation.id}`} evaluation={evaluation} />)
    );
};

export default UpcomingEventsCard;
