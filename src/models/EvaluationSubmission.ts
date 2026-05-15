import Evaluation from "./Evaluation";
import Student from "./Student";
import { Teacher } from "./Teachers";

export default interface EvaluationSubmission {
    download_url?: string | null;
    evaluation: Evaluation;
    student: Student;
    grade?: number;
    submission_status?: string;
    grader?: Teacher;
    submission_text?: string;
    submission_file?: string | null;
    original_filename?: string | null;
    created_at: string;
    updated_at: string;
}
