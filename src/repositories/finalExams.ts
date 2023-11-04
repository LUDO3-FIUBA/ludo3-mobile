import {get, post} from './authenticatedRepository';
import {getInfo} from './users';
import {Subject, FinalExam, User} from '../models';
import {StatusCodeError} from '../networking';
import { NotASubject } from './utilTypes';

const domainUrl = 'api/final_exams';

export class NotAFinal extends Error {
  constructor() {
    super('No es un final válido.');
    this.name = 'NotAValidFinalID';
  }
}

export class IdentityFail extends Error {
  constructor() {
    super('No eres quien dices ser.');
    this.name = 'IdentityValidationFail';
  }
}

export async function fetchForSubject(id: string): Promise<FinalExam[]> {
  const json = await get('api/subjects/history', [
    {
      key: 'subject_siu_id', 
      value: id
    },
  ]);
  return convertJsonToFinalExamsList(json, true);
}

export async function fetchApproved(filterType?: any, filterValue?: any): Promise<FinalExam[]> {
  const queryParams: { key: string, value: string }[] = [];
  if (filterType) {
    queryParams.push({
      key: filterType, value: filterValue
    });
  }
  const json = await get(`${domainUrl}/history`, queryParams);
  return convertJsonToFinalExamsList(json, false);
}

export function fetchApprovedCorrelatives(subjectCode: string): Promise<FinalExam[]> {
  return get(`${domainUrl}/correlatives`, [{key: 'code', value: subjectCode}])
    .catch(error => {
      if (error instanceof StatusCodeError && error.code == 404) {
        return Promise.reject(new NotASubject());
      }
      return Promise.reject(error);
    })
    .then(json => Promise.resolve(convertJsonToFinalExamsList(json, false)));
}

export function fetchPending(): Promise<FinalExam[]> {
  return get(`${domainUrl}/pending`).then(json =>
    Promise.resolve(convertJsonToFinalExamsList(json, false)),
  );
}

export function submitExam(finalId: string, image: string): Promise<User> {
  return post(`${domainUrl}/take_exam`, {final: finalId, image: `'${image}'`})
    .catch(error => {
      if (
        error instanceof StatusCodeError &&
        error.isBecauseOf('invalid_image')
      ) {
        // No face detected error or not valid face
        return Promise.reject(new IdentityFail());
      } else if (error instanceof StatusCodeError && error.code == 404) {
        return Promise.reject(new NotAFinal());
      }
      return Promise.reject(error);
    })
    .then(json => getInfo());
}

function convertJsonToFinalExamsList(json: any, dateAscending = false): FinalExam[] {
  return json
    ? json
        .sort((a: any, b: any) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          if (aDate == bDate) {
            return 0;
          }
          if (dateAscending) {
            return aDate < bDate ? -1 : 1;
          }
          return aDate < bDate ? 1 : -1;
        })
        .map(
          (exam: any, index: string) =>
            new FinalExam(
              exam.id,
              exam.final,
              new Subject(
                exam.subject.id,
                exam.subject.code,
                exam.subject.name,
                exam.teacher_name,
              ),
              new Date(exam.date),
              exam.grade,
              exam.act,
            ),
        )
    : [];
}

export default {
  fetchApproved,
  fetchApprovedCorrelatives,
  fetchPending,
  fetchForSubject,
  submitExam,
  IdentityFail,
  NotAFinal,
  NotASubject,
};
