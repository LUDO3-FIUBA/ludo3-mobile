import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post, put, deleteMethod } from './authenticatedRepository';
import AdminCommission from '../models/AdminCommission';

const BASE_URL = 'api/admin/commissions';

function toSnakeCase(data: Partial<AdminCommission>): object {
  return {
    subject_siu_id: data.subjectSiuId,
    subject_name: data.subjectName,
    chief_teacher: data.chiefTeacher?.id,
    siu_id: data.siuId,
    chief_teacher_grader_weight: data.chiefTeacherGraderWeight ?? 5.0,
  };
}

export async function fetchAll(): Promise<AdminCommission[]> {
  const data = await get(BASE_URL) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as AdminCommission);
}

export async function fetchOne(id: number): Promise<AdminCommission> {
  const data = await get(`${BASE_URL}/${id}`);
  return convertSnakeToCamelCase(data) as AdminCommission;
}

export async function createCommission(data: Partial<AdminCommission>): Promise<AdminCommission> {
  const result = await post(BASE_URL, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as AdminCommission;
}

export async function updateCommission(id: number, data: Partial<AdminCommission>): Promise<AdminCommission> {
  const result = await put(`${BASE_URL}/${id}`, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as AdminCommission;
}

export async function deleteCommission(id: number): Promise<void> {
  await deleteMethod(`${BASE_URL}/${id}`, {});
}

export default { fetchAll, fetchOne, createCommission, updateCommission, deleteCommission };
