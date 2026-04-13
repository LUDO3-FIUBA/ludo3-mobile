export interface TeacherStudent {
  id: number;
  padron: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  legajo?: string;
}

export interface TeacherStudentSnakeCase {
  id: number;
  padron: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  legajo?: string
}
