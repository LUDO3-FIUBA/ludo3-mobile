import { get, post } from './authenticatedRepository';
import { getInfo } from './users';
import { Subject, FinalExam, User } from '../models';
import { StatusCodeError } from '../networking';

const domainUrl = 'api/subjects';

export function fetchInCourse(): Promise<Subject[]> {
    //   return get(`${domainUrl}/incourse`)
    //     .catch(error => {
    //       if (error instanceof StatusCodeError && error.code == 404) {
    //         return Promise.reject(new NotASubject());
    //       }
    //       return Promise.reject(error);
    //     })
    //     .then(json => Promise.resolve(convertJsonToFinalExamsList(json, false)));
    return Promise.resolve([
        new Subject(1, "61.10", "Analisis III", "Juan Martín Sirne"),
        new Subject(2, "62.03", "Fisica II", "Juan Martín Sirne"),
        new Subject(3, "61.09", "Probabilidad A", "Juan Martín Sirne"),
        new Subject(4, "75.41", "Algoritmos y Programación II", "Juan Martín Sirne"),
    ])
}


export default {
    fetchInCourse,
};
