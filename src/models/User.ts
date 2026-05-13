export default class User {
  readonly dni: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly studentId?: string;
  readonly isTeacherFlag: boolean;
  readonly isStaffFlag: boolean;
  readonly isSuperuserFlag: boolean;
  readonly departmentId: number | null;
  readonly faceRegistered: boolean;
  readonly githubUrl: string;
  readonly linkedinUrl: string;

  constructor(
    dni: string,
    firstName: string,
    lastName: string,
    email: string,
    studentId?: string = null,
    isTeacherFlag: boolean = false,
    isStaffFlag: boolean = false,
    faceRegistered: boolean = false,
    githubUrl: string = '',
    isSuperuserFlag: boolean = false,
    departmentId: number | null = null,
    linkedinUrl: string = '',
  ) {
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.studentId = studentId === undefined ? null : studentId;
    this.isTeacherFlag = isTeacherFlag;
    this.isStaffFlag = isStaffFlag;
    this.isSuperuserFlag = isSuperuserFlag;
    this.departmentId = departmentId;
    this.faceRegistered = faceRegistered;
    this.githubUrl = githubUrl;
    this.linkedinUrl = linkedinUrl;
  }

  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isStudent(): boolean {
    return this.studentId !== null;
  }

  isTeacher(): boolean {
    return this.isTeacherFlag;
  }

  isAdmin(): boolean {
    return this.isStaffFlag;
  }

  isSuperAdmin(): boolean {
    return this.isStaffFlag && this.isSuperuserFlag;
  }

  isDepartmentAdmin(): boolean {
    return this.isStaffFlag && !this.isSuperuserFlag && this.departmentId !== null;
  }

  id(): string {
    if (this.studentId !== null) {
      return this.studentId;
    }
    return this.dni;
  }

  toObject() {
    return {
      dni: this.dni,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      studentId: this.studentId,
      isTeacherFlag: this.isTeacherFlag,
      isStaffFlag: this.isStaffFlag,
      isSuperuserFlag: this.isSuperuserFlag,
      departmentId: this.departmentId,
      faceRegistered: this.faceRegistered,
      githubUrl: this.githubUrl,
      linkedinUrl: this.linkedinUrl,
    };
  }
}
