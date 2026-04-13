import { TeacherCommission, TeacherCommissionSnakeCase } from "./TeacherCommission";
import { TeacherModel, TeacherModelSnakeCase } from "./TeacherModel";

export interface TeacherTuple {
  commission: TeacherCommission;
  teacher: TeacherModel;
  role: string;
  graderWeight: number;
}

export interface TeacherTupleSnakeCase {
  commission: TeacherCommissionSnakeCase;
  teacher: TeacherModelSnakeCase;
  role: string;
  grader_weight: number;
}
