import { TeacherStudent, TeacherStudentSnakeCase } from "./TeacherStudent";
import { TeacherModel } from "./TeacherModel";

export interface Submission {
  student: TeacherStudent;
  grade: string | null;
  submissionStatus?: 'APROBADO' | 'DESAPROBADO' | null;
  grader:  TeacherModel | null;
  downloadUrl?: string | null;
  feedbackText?: string | null;
}

export interface SubmissionSnakeCase {
  student: TeacherStudentSnakeCase;
  grade: string | null;
  submission_status?: 'APROBADO' | 'DESAPROBADO' | null;
  grader:  TeacherModel | null;
  download_url?: string | null;
  feedback_text?: string | null;
}
