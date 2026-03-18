import { Semester } from ".";

export default interface Evaluation {
    id: number;
    evaluation_name: string;
    passing_grade: number;
    start_date: string | null;
    end_date: string;
    requires_qr: boolean;
    requires_identity: boolean;
    semester: Semester;
}
