export default interface AdminCommission {
  id: number;
  subjectSiuId: number;
  subjectName: string;
  siuId: number;
  chiefTeacher: {
    id: number;
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    legajo: string;
  };
  chiefTeacherGraderWeight: number;
}
