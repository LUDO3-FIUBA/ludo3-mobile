import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, patch } from './authenticatedRepository';
import AdminUser from '../models/AdminUser';

const BASE_URL = 'api/admin/users';

export async function searchByDni(dni: string): Promise<AdminUser[]> {
  const data = await get(`${BASE_URL}/search`, [{ key: 'dni', value: dni }]) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as AdminUser);
}

export async function fetchOne(id: number): Promise<AdminUser> {
  const data = await get(`${BASE_URL}/${id}`);
  return convertSnakeToCamelCase(data) as AdminUser;
}

export async function updateUser(id: number, data: Record<string, any>): Promise<AdminUser> {
  const snakeData: Record<string, any> = {};
  if (data.firstName !== undefined) snakeData.first_name = data.firstName;
  if (data.lastName !== undefined) snakeData.last_name = data.lastName;
  if (data.email !== undefined) snakeData.email = data.email;
  if (data.dni !== undefined) snakeData.dni = data.dni;
  if (data.padron !== undefined) snakeData.padron = data.padron;
  if (data.legajo !== undefined) snakeData.legajo = data.legajo;
  if (data.promoteToTeacher) snakeData.promote_to_teacher = true;
  if (data.promoteToStudent) snakeData.promote_to_student = true;
  if (data.newLegajo) snakeData.new_legajo = data.newLegajo;
  if (data.newPadron) snakeData.new_padron = data.newPadron;

  const result = await patch(`${BASE_URL}/${id}`, snakeData);
  return convertSnakeToCamelCase(result) as AdminUser;
}

export default { searchByDni, fetchOne, updateUser };
