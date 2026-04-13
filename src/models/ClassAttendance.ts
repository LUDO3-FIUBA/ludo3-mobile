import { StudentAttendance, StudentAttendanceSnakeCase } from "./StudentAttendance";

export interface ClassAttendance {
    createdAt:  Date;
    expiresAt:  Date;
    qrid:        string;
    attendances: StudentAttendance[];
}

export interface ClassAttendanceSnakeCase {
    created_at:  Date;
    expires_at:  Date;
    qrid:        string;
    attendances: StudentAttendanceSnakeCase[];
}
