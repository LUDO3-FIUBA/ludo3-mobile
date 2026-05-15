import { StudentAttendance, StudentAttendanceSnakeCase } from "./StudentAttendance";

export type AttendanceMode = 'qr' | 'qr_location';
export type Campus = 'las_heras' | 'paseo_colon';

export const CAMPUS_NAMES: Record<Campus, string> = {
    las_heras: 'Las Heras',
    paseo_colon: 'Paseo Colón',
};

export interface ClassAttendance {
    createdAt:   Date;
    expiresAt:   Date;
    validUntil:  Date;
    qrid:        string;
    attendances: StudentAttendance[];
    mode:        AttendanceMode;
    campus:      Campus | null;
}

export interface ClassAttendanceSnakeCase {
    created_at:  Date;
    expires_at:  Date;
    valid_until: Date;
    qrid:        string;
    attendances: StudentAttendanceSnakeCase[];
    mode:        AttendanceMode;
    campus:      Campus | null;
}
