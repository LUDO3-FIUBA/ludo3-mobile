import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import { get, post } from './authenticatedRepository';

const BASE_URL = 'api/bedelia/classroom-changes';

export interface BedeliaCommission {
  id: number;
  subjectName: string;
  siuId: number;
  chiefTeacherName: string;
}

export interface ClassroomChangePayload {
  commissionId: number;
  message: string;
  isUrgent: boolean;
  sendPush: boolean;
}

export interface ClassroomChangeResult {
  id: number;
  recipientCount: number;
  title: string;
}

export async function fetchCommissions(): Promise<BedeliaCommission[]> {
  const data = (await get(`${BASE_URL}/commissions`)) as any[];
  return data.map(item => convertSnakeToCamelCase(item) as BedeliaCommission);
}

export async function announceClassroomChange(
  payload: ClassroomChangePayload,
): Promise<ClassroomChangeResult> {
  const body = {
    commission_id: payload.commissionId,
    message: payload.message,
    is_urgent: payload.isUrgent,
    send_push: payload.sendPush,
  };
  const data = await post(BASE_URL, body);
  return convertSnakeToCamelCase(data) as ClassroomChangeResult;
}

export default { fetchCommissions, announceClassroomChange };
