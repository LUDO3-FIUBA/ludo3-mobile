import { TeacherSemester } from "./TeacherSemester";
import { TeacherModel } from "./TeacherModel";
import { AttendanceMode, Campus } from "./ClassAttendance";

export interface QRAttendance {
  semester:       TeacherSemester;
  ownerTeacher:   TeacherModel;
  createdAt:      Date;
  expiresAt:      Date;
  qrid:           string;
  mode:           AttendanceMode;
  campus:         Campus | null;
}

export interface QRAttendanceSnakeCase {
  semester:       TeacherSemester;
  owner_teacher:  TeacherModel;
  created_at:     Date;
  expires_at:     Date;
  qrid:           string;
  mode:           AttendanceMode;
  campus:         Campus | null;
}
