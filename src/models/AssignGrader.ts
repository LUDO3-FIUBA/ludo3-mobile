import { TeacherEvaluation } from "./TeacherEvaluation";
import { TeacherStudent } from "./TeacherStudent";
import { TeacherModel } from "./TeacherModel";

export interface AssignGrader {
    evaluation: TeacherEvaluation;
    student:    TeacherStudent;
    grade:      null;
    grader:     TeacherModel;
    createdAt: Date;
    updatedAt: Date;
}

export interface AssignGraderCamelCase {
    evaluation: TeacherEvaluation;
    student:    TeacherStudent;
    grade:      null;
    grader:     TeacherModel;
    created_at: Date;
    updated_at: Date;
}
