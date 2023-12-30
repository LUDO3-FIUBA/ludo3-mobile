import { get, post } from './authenticatedRepository';
import { Evaluation, EvaluationSubmission } from '../models';

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

async function submitEvaluation(evaluationId: string): Promise<EvaluationSubmission> {
    // TODO: error handling like in finalExamsRepository.submitExam
    return await post(`${domainUrl}/submissions/submit_evaluation`, { evaluation: evaluationId }) as EvaluationSubmission
}

function convertJsonToEvaluationsList(json: any): Evaluation[] {
    console.log("EVALUATIONS", json);
    
    return json
        ? json.map((evaluation: any) => <Evaluation>{ ...evaluation })
        : [];
}

export default {
    fetchSemesterEvaluations,
    fetchMisExamenes,
    submitEvaluation
};
