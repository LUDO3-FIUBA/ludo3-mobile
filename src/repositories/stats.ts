import { StudentStats } from '../models';
import { get } from './authenticatedRepository';

const domainUrl = 'api/statistics';

export async function fetchStudentStats(): Promise<StudentStats> {
  // return await get(`${domainUrl}/student`) as StudentStats;
  return {
    averageOverTime: {
      "12-20": 6.9, "1-21": 6.8, "1-22": 6.9, "2-23": 7.0, "2-24": 6.9, "12-25": 7.0
    },
    averageComparison: {
      studentAverage: 7.1,
      globalAverage: 6.2,
    },
    topSubjects: {
      "Analisis II": {
        studentAverage: 6.1,
        globalAverage: 4.2,
      },
      "Taller de Programacion II": {
        studentAverage: 6.1,
        globalAverage: 5.0,
      },
      "Fisica I": {
        studentAverage: 6.5,
        globalAverage: 6.1,
      },
    }
  }
}

export default { fetchStudentStats };
