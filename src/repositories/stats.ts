import { StudentStats } from '../models';
import { get } from './authenticatedRepository';

const domainUrl = 'api/statistics';

export async function fetchStudentStats(): Promise<StudentStats> {
  // return await get(`${domainUrl}/student`) as StudentStats;
  return {
    averageOverTime: {
      "2020C2": 6.9, "2021C1": 6.8, "2021C2": 6.9, "2022C1": 7.0, "2022C2": 6.9, "2023C1": 7.0
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
