import { TeacherModel } from "./TeacherModel";
import { TeacherModelSnakeCase } from "./TeacherModel";
import { TeacherEvaluation, TeacherEvaluationSnakeCase } from "./TeacherEvaluation";
import { TeacherStudent, TeacherStudentSnakeCase } from "./TeacherStudent";

export interface GradeChange {
  evaluation: TeacherEvaluation;
  student: TeacherStudent;
  grade: number;
  grader: TeacherModel;
  createdAt: Date;
  updatedAt: Date;
}
export interface GradeChangeSnakeCase {
  evaluation: TeacherEvaluationSnakeCase;
  student: TeacherStudentSnakeCase;
  grade: number;
  grader: TeacherModelSnakeCase;
  created_at: Date;
  updated_at: Date;
}
