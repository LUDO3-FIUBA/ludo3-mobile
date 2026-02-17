export interface TeacherSubject {
  id: number;
  code: string;
  name: string;
  departmentId: number;
  correlatives: any[];
}

export interface TeacherSubjectCamelCase {
  id: number;
  code: string;
  name: string;
  department_id: number;
  correlatives: any[];
}
