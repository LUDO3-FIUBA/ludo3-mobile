import Evaluation from "./Evaluation";
import Student from "./Student";
import { Teacher } from "./Teachers";

export default interface EvaluationSubmission {
    evaluation: Evaluation;
    student: Student;
    grade?: number;
    submission_status?: string;
    grader?: Teacher;
    submission_text?: string;
    created_at: string;
    updated_at: string;
}
