import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post, put, deleteMethod } from './authenticatedRepository';
import Department from '../models/Department';

const BASE_URL = 'api/departments';

function toSnakeCase(data: Partial<Department>): object {
  return {
    name: data.name,
    location: data.location ?? '',
    schedule: data.schedule ?? '',
    contact_info: data.contactInfo ?? '',
    procedures: data.procedures ?? '',
  };
}

export async function fetchAll(): Promise<Department[]> {
  const data = await get(BASE_URL) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as Department);
}

export async function fetchOne(id: number): Promise<Department> {
  const data = await get(`${BASE_URL}/${id}`);
  return convertSnakeToCamelCase(data) as Department;
}

export async function createDepartment(data: Partial<Department>): Promise<Department> {
  const result = await post(BASE_URL, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as Department;
}

export async function updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
  const result = await put(`${BASE_URL}/${id}`, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as Department;
}

export async function deleteDepartment(id: number): Promise<void> {
  await deleteMethod(`${BASE_URL}/${id}`, {});
}

export default { fetchAll, fetchOne, createDepartment, updateDepartment, deleteDepartment };
