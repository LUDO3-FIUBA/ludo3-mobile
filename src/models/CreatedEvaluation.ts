export interface CreatedEvaluation {
  semesterId:   number;
  evaluationName: string;
  isGraded:     boolean;
  passingGrade: number;
  startDate:    Date;
  endDate:      Date;
  requiresIdentity: boolean;
  requiresQr: boolean;
}

export interface CreatedEvaluationSnakeCase {
  semester_id:     number;
  evaluation_name: string;
  is_graded:       boolean;
  passing_grade:   number;
  start_date:      Date;
  end_date:        Date;
  requires_identity: boolean;
  requires_qr: boolean;
}
