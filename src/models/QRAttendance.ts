import { TeacherSemester } from "./TeacherSemester";
import { TeacherModel } from "./TeacherModel";

export interface QRAttendance {
  semester:       TeacherSemester;
  ownerTeacher:   TeacherModel;
  createdAt:      Date;
  expiresAt:      Date;
  qrid:           string;
}

export interface QRAttendanceSnakeCase {
  semester:       TeacherSemester;
  owner_teacher:  TeacherModel;
  created_at:     Date;
  expires_at:     Date;
  qrid:           string;
}
