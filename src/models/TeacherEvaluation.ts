export interface TeacherEvaluation {
  id:             number;
  evaluationName: string;
  passingGrade:   number | null;
  isGraded:       boolean;
  isGradeable?:   boolean;
  requiresQr?:    boolean;
  requiresIdentity?: boolean;
  parentEvaluation?: number | null;
  startDate:      Date;
  endDate:        Date;
}

export interface TeacherEvaluationSnakeCase {
  id:               number,
  evaluation_name:  string;
  is_graded:        boolean;
  passing_grade:    number | null;
  is_gradeable?:    boolean;
  requires_qr?:     boolean;
  requires_identity?: boolean;
  parent_evaluation?: number | null;
  start_date:       Date;
  end_date:         Date;
}
