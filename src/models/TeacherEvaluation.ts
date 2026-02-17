export interface TeacherEvaluation {
  id:             number;
  evaluationName: string;
  passingGrade:   number;
  isGraded:       boolean;
  startDate:      Date;
  endDate:        Date;
}

export interface TeacherEvaluationSnakeCase {
  id:               number,
  evaluation_name:  string;
  is_graded:        boolean;
  passing_grade:    number;
  start_date:       Date;
  end_date:         Date;
}
