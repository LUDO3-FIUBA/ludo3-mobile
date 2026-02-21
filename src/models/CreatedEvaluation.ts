export interface CreatedEvaluation {
  semesterId:   number;
  evaluationName: string;
  isGraded:     boolean;
  passingGrade: number;
  startDate:    Date;
  endDate:      Date;
}

export interface CreatedEvaluationSnakeCase {
  semester_id:     number;
  evaluation_name: string;
  is_graded:       boolean;
  passing_grade:   number;
  start_date:      Date;
  end_date:        Date;
}
