import { TeacherTuple } from '../models';
import { get } from './authenticatedRepository';

const domainUrl = 'api/commissions';

export async function fetchTeachersOfCommission(commissionId: number): Promise<TeacherTuple[]> {
  return await get(`${domainUrl}/teachers`, [{key: 'commission_id', value: commissionId}]) as TeacherTuple[];
}

export default { fetchTeachersOfCommission };
