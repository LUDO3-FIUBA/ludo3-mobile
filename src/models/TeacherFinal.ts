import { FinalStatus } from './FinalStatus';
import { TeacherSubject } from './TeacherSubject';
import { TeacherFinalExam, TeacherFinalExamCamelCase } from './TeacherFinalExam';

export interface TeacherFinal {
  id: number;
  subject: TeacherSubject;
  date: string;
  qrid: string;
  status: FinalStatus;
  siuId: number;
  act: null;
  finalExams: TeacherFinalExam[];
  teacher: number;
}

export interface TeacherFinalCamelCase {
  id: number;
  subject: TeacherSubject;
  date: string;
  qrid: string;
  status: string;
  siu_id: number;
  act: null;
  final_exams?: TeacherFinalExamCamelCase[];
  teacher: number;
}

export function calculateFinalCurrentStatus(final: TeacherFinal): FinalStatus {
  switch (final.status) {
    case FinalStatus.Draft:
      return FinalStatus.Draft;
    case FinalStatus.Rejected:
      return FinalStatus.Rejected;
    case FinalStatus.Closed:
      return FinalStatus.Closed;
    case FinalStatus.Grading:
      return FinalStatus.Grading;
    default:
      const finalAsDate = new Date(final.date);
      finalAsDate.setHours(finalAsDate.getHours() - 5);

      if (new Date().getTime() < finalAsDate.getTime()) {
        return FinalStatus.Future;
      }
      if (new Date().getTime() >= finalAsDate.getTime()) {
        return FinalStatus.Open;
      }
      return FinalStatus.SoonToStart;
  }
}
