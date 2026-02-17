import { TeacherStudent } from "./TeacherStudent";

export interface StudentAttendance {
    student: TeacherStudent,
    submittedAt: Date
}

export interface StudentAttendanceSnakeCase {
    student:      TeacherStudent;
    submitted_at: Date;
}
