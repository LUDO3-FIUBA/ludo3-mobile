import { SemesterStats } from '../models/SemesterStats';
import { get } from './authenticatedRepository';

const domainUrl = 'api/statistics';

export async function fetchSemesterStats(semesterId: number): Promise<SemesterStats> {
  const data = await get(`${domainUrl}/teacher`, [{ key: 'semester_id', value: semesterId }]) as SemesterStats;
  console.log(`StatsRepository: ${JSON.stringify(data)}`)
  return data;
}

export default { fetchSemesterStats };
