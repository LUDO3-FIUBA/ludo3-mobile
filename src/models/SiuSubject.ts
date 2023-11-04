export default class Subject {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly professor: string;
  readonly department_id: number;
  readonly correlatives: string[];

  constructor(id: number, code: string, name: string, professor: string, department_id: number, correlatives: string[]) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.professor = professor;
    this.department_id = department_id;
    this.correlatives = correlatives;
  }

  toObject() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      professor: this.professor,
      department_id: this.department_id,
      correlatives: this.correlatives,
    };
  }

  static fromObject(object: any) {
    return new Subject(object.id, object.code, object.name, object.professor, object.department_id, object.correlatives);
  }
}
