import { TeacherFinal, TeacherFinalCamelCase } from '../models/TeacherFinal';
import { TeacherFinalExam } from '../models/TeacherFinalExam';
import { get, post, put } from './authenticatedRepository';
import { StatusCodeError } from '../networking';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';

const domainUrl = 'api/finals';

export class IdentityFail extends Error {
  constructor() {
    super('No eres quien dices ser.');
    this.name = 'IdentityValidationFail';
  }
}

export async function fetchFromSubject(subjectId: number): Promise<any> {
  const response: TeacherFinalCamelCase[] = await get(`${domainUrl}`, [{ key: 'subject_siu_id', value: subjectId }]) as TeacherFinalCamelCase[]
  const allFinals = response.map((json: TeacherFinalCamelCase) => convertSnakeToCamelCase(json) as TeacherFinal);
  return allFinals
}

export async function getDetail(finalId: number): Promise<TeacherFinal> {
  const finalData: TeacherFinalCamelCase = await get(`${domainUrl}/${finalId}`) as TeacherFinalCamelCase
  return convertSnakeToCamelCase(finalData) as TeacherFinal;
}

export async function grade(
  finalId: number,
  finalExams: { finalExamSubmissionId: number, grade: number }[],
): Promise<boolean> {
  var body = { grades: finalExams.map(exam => ({ final_exam_id: exam.finalExamSubmissionId, grade: exam.grade })) }
  console.log('body', body);

  await put(`${domainUrl}/${finalId}/grade`, body)
  return true
}

export async function addStudent(
  finalId: number,
  padron: number,
): Promise<TeacherFinalExam> {
  const finalExam = await post(`${domainUrl}/${finalId}/final_exams`, {
    padron: padron,
  })

  return convertSnakeToCamelCase(finalExam) as TeacherFinalExam;
}

export async function close(finalId: number, image: string): Promise<boolean> {
  const response = await post(`${domainUrl}/${finalId}/close`, '')
  return true
}

export async function sendAct(finalId: number, image: string): Promise<boolean> {
  try {
    const response = await post(`${domainUrl}/${finalId}/send_act`, {
      image: `'${image}'`,
    })
    return true
  } catch (error) {
    if (
      error instanceof StatusCodeError &&
      error.isBecauseOf('invalid_image')
    ) {
      return Promise.reject(new IdentityFail());
    }
    return Promise.reject(error);
  }
}

export async function createFinal(subjectId: number, subjectName: string, date: Date): Promise<TeacherFinal> {
  console.log("Creating final", subjectId, subjectName);

  const createdFinal = await post(`${domainUrl}`, {
    subject_siu_id: subjectId,
    subject_name: subjectName,
    timestamp: Math.trunc(date.getTime() / 1000),
  }) as TeacherFinalCamelCase
  return convertSnakeToCamelCase(createdFinal) as TeacherFinal;
}

export function notifyGrades(finalId: number): Promise<boolean> {
  return post(`${domainUrl}/${finalId}/notify_grades`, '').then(json =>
    Promise.resolve(true),
  );
}

export default {
  fetchFromSubject,
  getDetail,
  grade,
  addStudent,
  close,
  sendAct,
  createFinal,
  notifyGrades,
  IdentityFail,
};
