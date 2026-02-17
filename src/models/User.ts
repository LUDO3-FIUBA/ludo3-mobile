export default class User {
  readonly dni: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly studentId?: string;
  readonly isTeacherFlag: boolean;

  constructor(
    dni: string,
    firstName: string,
    lastName: string,
    email: string,
    studentId?: string = null,
    isTeacherFlag: boolean = false,
  ) {
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.studentId = studentId === undefined ? null : studentId;
    this.isTeacherFlag = isTeacherFlag;
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
    };
  }
}
