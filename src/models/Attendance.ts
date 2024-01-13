import Semester from "./Semester";
import Student from "./Student";

export default interface Attendance {
    semester: Semester;
    student: Student;
    qrid: string;
    submitted_at: string;
}
