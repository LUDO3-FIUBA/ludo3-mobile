export default interface AdminUser {
  id: number;
  dni: string;
  email: string;
  firstName: string;
  lastName: string;
  isStudent: boolean;
  isTeacher: boolean;
  isStaff: boolean;
  padron: string | null;
  legajo: string | null;
}
