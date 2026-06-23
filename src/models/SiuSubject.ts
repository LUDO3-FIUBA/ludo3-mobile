export default class Subject {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly professor: string;
  readonly correlatives: string[];

  constructor(id: number, code: string, name: string, professor: string, correlatives: string[]) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.professor = professor;
    this.correlatives = correlatives;
  }

  toObject() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      professor: this.professor,
      correlatives: this.correlatives,
    };
  }

  static fromObject(object: any) {
    return new Subject(object.id, object.code, object.name, object.professor, object.correlatives);
  }
}
