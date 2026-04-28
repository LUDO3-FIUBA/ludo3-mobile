export interface TeacherStudent {
  id: number;
  padron: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  legajo?: string;
  attendancesCount?: number;
  submissions?: Array<{
    evaluationId: number;
    grade: number | null;
  }>;
}

export interface TeacherStudentSnakeCase {
  id: number;
  padron: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  legajo?: string;
  attendances_count?: number;
  submissions?: Array<{
    evaluation_id: number;
    grade: number | null;
  }>;
}
