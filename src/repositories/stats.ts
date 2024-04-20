import { StudentStats } from '../models';
import { get } from './authenticatedRepository';

const domainUrl = 'api/statistics';

export async function fetchStudentStats(): Promise<StudentStats> {
  return await get(`${domainUrl}/student`) as StudentStats;
}

export default { fetchStudentStats };
