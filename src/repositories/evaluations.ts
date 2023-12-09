import { get } from './authenticatedRepository';
import { Evaluation } from '../models';

const domainUrl = 'api/evaluations';

async function fetchSemesterEvaluations(semester_id: string): Promise<Evaluation[]> {
    return get(`${domainUrl}`, [{ key: 'semester_id', value: semester_id }])
        .catch(error => {
            // if (error instanceof StatusCodeError && error.code == 404) {
            //     return Promise.reject(new NotASubject());
            // }
            return Promise.reject(error);
        })
        .then(json => Promise.resolve(convertJsonToEvaluationsList(json)));
}

async function fetchMisExamenes(): Promise<Evaluation[]> {
    return get(`${domainUrl}/mis_examenes`)
        .catch(error => {
            // if (error instanceof StatusCodeError && error.code == 404) {
            //     return Promise.reject(new NotASubject());
            // }
            return Promise.reject(error);
        })
        .then(json => Promise.resolve(convertJsonToEvaluationsList(json)));
}

function convertJsonToEvaluationsList(json: any): Evaluation[] {
    console.log("EVALUATIONS", json);
    
    return json
        ? json.map((evaluation: any) => <Evaluation>{ ...evaluation })
        : [];
}

export default {
    fetchSemesterEvaluations,
    fetchMisExamenes
};
