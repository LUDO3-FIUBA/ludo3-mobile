import { TeacherStudent } from "./TeacherStudent";

export interface StudentAttendance {
    student: TeacherStudent,
    submittedAt: Date;
    locationValid?: boolean | null;
}

export interface StudentAttendanceSnakeCase {
    student:      TeacherStudent;
    submitted_at: Date;
    location_valid?: boolean | null;
}

export interface MyAttendance {
    createdAt: string;
    expiresAt: string;
    qrid: string;
    attended: boolean;
    submittedAt: string | null;
    mode: 'qr' | 'qr_location';
    campus: string | null;
    locationValid?: boolean | null;
}

export interface MyAttendanceSnakeCase {
    created_at: string;
    expires_at: string;
    qrid: string;
    attended: boolean;
    submitted_at: string | null;
    mode: 'qr' | 'qr_location';
    campus: string | null;
    location_valid?: boolean | null;
}
