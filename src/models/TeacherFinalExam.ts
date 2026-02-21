import { TeacherStudent } from "./TeacherStudent";

export interface TeacherFinalExam {
  id:                    number;
  student:               TeacherStudent;
  grade:                 number;
  correlativesApproved: boolean;
}

export interface TeacherFinalExamCamelCase {
  id:                    number;
  student:               TeacherStudent;
  grade:                 number;
  correlatives_approved: boolean;
}
