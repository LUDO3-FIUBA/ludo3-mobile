import { get } from './authenticatedRepository';
import { SiuSubject } from '../models';
import { StatusCodeError } from '../networking';
import { NotASubject } from './utilTypes';

const domainUrl = 'api/subjects';

function fetchInCourse(): Promise<SiuSubject[]> {
    //   return get(`${domainUrl}/incourse`)
    //     .catch(error => {
    //       if (error instanceof StatusCodeError && error.code == 404) {
    //         return Promise.reject(new NotASubject());
    //       }
    //       return Promise.reject(error);
    //     })
    //     .then(json => Promise.resolve(convertJsonToSubjectsList(json, false)));
    return Promise.resolve([
        new SiuSubject(1, "61.10", "Analisis III", "Juan Martín Sirne", 1, []),
        new SiuSubject(2, "62.03", "Fisica II", "Juan Martín Sirne", 1, []),
        new SiuSubject(3, "61.09", "Probabilidad A", "Juan Martín Sirne", 1, []),
        new SiuSubject(4, "75.41", "Algoritmos y Programación II", "Juan Martín Sirne", 1, []),
    ])
}

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
    fetchInCourse,
    fetchCorrelatives
};
