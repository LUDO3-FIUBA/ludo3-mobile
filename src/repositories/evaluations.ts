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

async function fetchSubmission(evaluation_id: number): Promise<EvaluationSubmission[]> {
    return get(`${domainUrl}/${evaluation_id}/my_submissions`)
        .catch(error => {
            // if (error instanceof StatusCodeError && error.code == 404) {
            //     return Promise.reject(new NotAFinal());
            // }
            return Promise.reject(error);
        })
        .then(json => json as EvaluationSubmission[]);
}

async function fetchMySubmissions(semester_id: string): Promise<EvaluationSubmission[]> {
    return get(`${domainUrl}/submissions/my_evaluations`, [{ key: 'semester_id', value: semester_id }])
        .catch(error => {
            return Promise.reject(error);
        })
        .then(json => json as EvaluationSubmission[]);
}



async function submitEvaluation(
    evaluationId: string,
    submissionText: string = '',
    submissionFile?: { uri: string; name: string; type?: string } | File,
): Promise<EvaluationSubmission> {
    if (submissionFile) {
        const form = new FormData();
        form.append('evaluation', evaluationId);
        form.append('submission_text', submissionText);

        if ((submissionFile as any).uri) {
            const f: any = submissionFile as any;
            form.append('submission_file', {
                uri: f.uri,
                name: f.name,
                type: f.type || 'application/octet-stream',
            } as any);
        } else {
            form.append('submission_file', submissionFile as any);
        }

        return await post(`${domainUrl}/submissions/submit_evaluation`, form) as EvaluationSubmission;
    }

    return await post(`${domainUrl}/submissions/submit_evaluation`, {
        evaluation: evaluationId,
        submission_text: submissionText,
    }) as EvaluationSubmission
}

function convertJsonToEvaluationsList(json: any): Evaluation[] {
    return json
        ? json.map((evaluation: any) => <Evaluation>{ ...evaluation })
        : [];
}

export default {
    fetchSemesterEvaluations,
    fetchMisExamenes,
    fetchSubmission: fetchSubmission,
    fetchMySubmissions,
    submitEvaluation
};
