import { TeacherFinal, TeacherFinalCamelCase } from '../models/TeacherFinal';
import { get, post } from './authenticatedRepository';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';

const BASE_URL = 'api/admin/finals';

export async function fetchPending(): Promise<TeacherFinal[]> {
  const data = await get(BASE_URL, [{ key: 'status', value: 'DF' }]) as TeacherFinalCamelCase[];
  return data.map(item => convertSnakeToCamelCase(item) as TeacherFinal);
}

export async function approve(id: number): Promise<TeacherFinal> {
  const data = await post(`${BASE_URL}/${id}/approve`, '') as TeacherFinalCamelCase;
  return convertSnakeToCamelCase(data) as TeacherFinal;
}

export async function reject(id: number): Promise<TeacherFinal> {
  const data = await post(`${BASE_URL}/${id}/reject`, '') as TeacherFinalCamelCase;
  return convertSnakeToCamelCase(data) as TeacherFinal;
}

export default { fetchPending, approve, reject };
