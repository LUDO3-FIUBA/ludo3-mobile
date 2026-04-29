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
    createdAt: string;
    expiresAt: string;
    qrid: string;
    attended: boolean;
    submittedAt: string | null;
}

export interface MyAttendanceSnakeCase {
    created_at: string;
    expires_at: string;
    qrid: string;
    attended: boolean;
    submitted_at: string | null;
}
