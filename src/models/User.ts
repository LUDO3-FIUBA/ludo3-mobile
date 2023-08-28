export default class User {
  readonly dni: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly studentId?: string;

  constructor(
    dni: string,
    firstName: string,
    lastName: string,
    email: string,
    studentId?: string = null,
  ) {
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.studentId = studentId === undefined ? null : studentId;
  }

  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isStudent(): boolean {
    return this.studentId !== null;
  }

  id(): string {
    if (this.studentId !== null) {
      return this.studentId;
    }
    return this.dni;
  }
}
