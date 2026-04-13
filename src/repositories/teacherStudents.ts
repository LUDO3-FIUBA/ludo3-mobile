import { TeacherStudent } from '../models/TeacherStudent';
import { TeacherStudentSnakeCase } from '../models/TeacherStudent';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get } from './authenticatedRepository';

const domainUrl = 'api/students';

export async function getStudentByPadron(padron: string): Promise<TeacherStudent> {
  const student: TeacherStudentSnakeCase = await get(`${domainUrl}`, [{key: 'padron', value: padron}]) as TeacherStudentSnakeCase;
  return convertSnakeToCamelCase(student)
}

export default {getStudentByPadron};
