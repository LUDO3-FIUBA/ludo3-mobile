import { IsPassing } from '../models';
import { get } from './authenticatedRepository';

const domainUrl = 'api/semesters';

export async function fetchIsPassing(semesterId: number): Promise<IsPassing> {
  return await get(`${domainUrl}/is_passing`, [{key: 'semester_id', value: semesterId}]) as IsPassing;
}

export default { fetchIsPassing };
