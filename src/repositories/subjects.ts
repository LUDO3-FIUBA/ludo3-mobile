import { get } from './authenticatedRepository';
import { SiuSubject } from '../models';
import { StatusCodeError } from '../networking';
import { NotASubject } from './utilTypes';

const domainUrl = 'api/subjects';

function fetchCorrelatives(id: string): Promise<SiuSubject[]> {
    return get(`${domainUrl}/correlatives`, [{ key: 'id', value: id }])
        .catch(error => {
            if (error instanceof StatusCodeError && error.code == 404) {
                return Promise.reject(new NotASubject());
            }
            return Promise.reject(error);
        })
        .then(json => Promise.resolve(convertJsonToSubjectsList(json)));
}

function convertJsonToSubjectsList(json: any): SiuSubject[] {
    return json
        ? json.map((subject: any, index: string) =>
            new SiuSubject(
                subject.id,
                subject.code,
                subject.name,
                subject.professor,
                subject.department_id,
                subject.correlatives
            ))
        : [];
}

export default {
    fetchCorrelatives
};
