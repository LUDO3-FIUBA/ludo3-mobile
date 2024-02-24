import Evaluation from "./Evaluation";
import Student from "./Student";
import { Teacher } from "./Teachers";

export default interface EvaluationSubmission {
    evaluation: Evaluation;
    student: Student;
    grade?: number;
    grader?: Teacher;
    created_at: string;
    updated_at: string;
}
