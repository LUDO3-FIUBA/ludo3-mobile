import { TeacherStudent } from "./TeacherStudent";

export interface StudentAttendance {
    student: TeacherStudent,
    submittedAt: Date
}

export interface StudentAttendanceSnakeCase {
    student:      TeacherStudent;
    submitted_at: Date;
}

export interface MyAttendance {
    qrid: string;
    submittedAt: string;
}

export interface MyAttendanceSnakeCase {
    qrid: string;
    submitted_at: string;
}
