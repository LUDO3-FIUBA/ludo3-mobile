import { TeacherStudent, TeacherStudentSnakeCase } from "./TeacherStudent";
import { TeacherModel } from "./TeacherModel";

export interface Submission {
  student: TeacherStudent;
  grade: string | null;
  grader:  TeacherModel | null;
}

export interface SubmissionSnakeCase {
  student: TeacherStudentSnakeCase;
  grade: string | null;
  grader:  TeacherModel | null;
}
