export interface CreatedEvaluation {
  semesterId:   number;
  evaluationName: string;
  isGraded:     boolean;
  passingGrade: number | null;
  startDate:    Date;
  endDate:      Date;
  requiresQr: boolean;
  requiresIdentity: boolean;
  isGradeable: boolean;
}

export interface CreatedEvaluationSnakeCase {
  semester_id:     number;
  evaluation_name: string;
  is_graded:       boolean;
  passing_grade:   number | null;
  start_date:      Date;
  end_date:        Date;
  requires_qr: boolean;
  requires_identity: boolean;
  is_gradeable: boolean;
}
