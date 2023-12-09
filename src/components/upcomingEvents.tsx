import React, { FC, useEffect, useState } from 'react';
import { Evaluation } from '../models';
import EventCard from './eventCard';
import { evaluationsRepository } from '../repositories';


const UpcomingEventsCard: FC = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([])

    async function fetch() {
        const evals = await evaluationsRepository.fetchMisExamenes()
        setEvaluations(evals)
    }

    useEffect(() => {
        fetch()
    }, [])

    return (
        evaluations.map(evaluation => <EventCard key={`${evaluation.id}`} evaluation={evaluation} />)
    );
};

export default UpcomingEventsCard;
