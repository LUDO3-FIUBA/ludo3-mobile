import {get, post} from './authenticatedRepository.ts';
import {getInfo} from './users.ts';
import {Subject, FinalExam} from '../models';
import {StatusCodeError} from '../networking';

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

export class NotASubject extends Error {
  constructor() {
    super('No es un código de materia válido.');
    this.name = 'NotAValidSubjectCode';
  }
}

export function fetchForSubject(id): Promise<FinalExam[]> {
  return get('api/subjects/history', [
    {key: 'subject_siu_id', value: id},
  ]).then(json => Promise.resolve(convertJsonToFinalExamsList(json, true)));
}

export function fetchApproved(filterType, filterValue): Promise<Subject[]> {
  let queryParams = [];
  if (filterType) {
    queryParams = [{key: filterType, value: filterValue}];
  }
  return get(`${domainUrl}/history`, queryParams).then(json =>
    Promise.resolve(convertJsonToFinalExamsList(json, false)),
  );
}

export function fetchApprovedCorrelatives(subjectCode): Promise<Subject[]> {
  return get(`${domainUrl}/correlatives`, [{key: 'code', value: subjectCode}])
    .catch(error => {
      if (error instanceof StatusCodeError && error.code == 404) {
        return Promise.reject(new NotASubject());
      }
      return Promise.reject(error);
    })
    .then(json => Promise.resolve(convertJsonToFinalExamsList(json, false)));
}

export function fetchPending(): Promise<Subject[]> {
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

function convertJsonToFinalExamsList(json, dateAscending = false): Subject[] {
  return json
    ? json
        .sort((a, b) => {
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
          (exam, index) =>
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
