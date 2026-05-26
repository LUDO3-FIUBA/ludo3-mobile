import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post, put, deleteMethod, patch } from './authenticatedRepository';
import Secretary from '../models/Secretary';

const BASE_URL = 'api/secretaries';

function toSnakeCase(data: Partial<Secretary>): object {
  return {
    name: data.name,
    parent_secretary: data.parentSecretary ?? null,
    location: data.location ?? '',
    schedule: data.schedule ?? '',
    contact_info: data.contactInfo ?? '',
  };
}

export async function fetchAll(): Promise<Secretary[]> {
  const data = await get(BASE_URL) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as Secretary);
}

export async function fetchOne(id: number): Promise<Secretary> {
  const data = await get(`${BASE_URL}/${id}`);
  return convertSnakeToCamelCase(data) as Secretary;
}

export async function createSecretary(data: Partial<Secretary>): Promise<Secretary> {
  const result = await post(BASE_URL, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as Secretary;
}

export async function updateSecretary(id: number, data: Partial<Secretary>): Promise<Secretary> {
  const result = await put(`${BASE_URL}/${id}`, toSnakeCase(data));
  return convertSnakeToCamelCase(result) as Secretary;
}

export async function deleteSecretary(id: number): Promise<void> {
  await deleteMethod(`${BASE_URL}/${id}`, {});
}

export async function updateMemberships(
  id: number,
  groups: { groupId: number; isEditor: boolean }[],
): Promise<Secretary> {
  const payload = {
    groups: groups.map(g => ({ group_id: g.groupId, is_editor: g.isEditor })),
  };
  const result = await patch(`${BASE_URL}/${id}/ownership-groups`, payload);
  return convertSnakeToCamelCase(result) as Secretary;
}

export default { fetchAll, fetchOne, createSecretary, updateSecretary, deleteSecretary, updateMemberships };
