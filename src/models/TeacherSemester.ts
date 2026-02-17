import { TeacherCommissionSnakeCase, TeacherCommission } from "./TeacherCommission";
import { TeacherEvaluation, TeacherEvaluationSnakeCase } from "./TeacherEvaluation";
import { TeacherStudent, TeacherStudentSnakeCase } from "./TeacherStudent";

export interface TeacherSemester {
  id: number
  yearMoment: string
  startDate: Date;
  commission: TeacherCommission
  evaluations: TeacherEvaluation[];
  students: TeacherStudent[];
  classesAmount: number;
  minimumAttendance: number;
}

export interface TeacherSemesterSnakeCase {
  id:                 number;
  year_moment:        string;
  start_date:         Date;
  commission:         TeacherCommission;
  evaluations:        TeacherEvaluationSnakeCase[];
  students:           TeacherStudentSnakeCase[];
  classes_amount:     number;
  minimum_attendance: number;
}
