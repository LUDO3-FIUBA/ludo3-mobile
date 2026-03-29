import { TeacherStudent, TeacherStudentSnakeCase } from "./TeacherStudent";
import { TeacherModel } from "./TeacherModel";

export interface Submission {
  student: TeacherStudent;
  grade: string | null;
  submissionStatus?: 'APROBADO' | 'DESAPROBADO' | null;
  grader:  TeacherModel | null;
}

export interface SubmissionSnakeCase {
  student: TeacherStudentSnakeCase;
  grade: string | null;
  submission_status?: 'APROBADO' | 'DESAPROBADO' | null;
  grader:  TeacherModel | null;
}
