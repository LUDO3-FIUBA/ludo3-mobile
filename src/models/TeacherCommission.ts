import { TeacherModel, TeacherModelSnakeCase } from "./TeacherModel";

export interface TeacherCommission {
  id: number;
  subjectSiuId: number;
  subjectName:   string;
  chiefTeacher:  TeacherModel;
  chiefTeacherGraderWeight: number;
}
export interface TeacherCommissionSnakeCase {
  id: number;
  subject_siu_id: number;
  subject_name:   string;
  chief_teacher:  TeacherModelSnakeCase;
  chief_teacher_grader_weight: number;
}
