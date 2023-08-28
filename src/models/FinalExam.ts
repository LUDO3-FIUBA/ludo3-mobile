import Subject from './Subject';

export default class FinalExam {
  readonly id: number;
  readonly finalId: number;
  readonly subject: Subject;
  readonly date: Date;
  readonly grade?: number | null;
  readonly act?: number | null;

  constructor(
    id: number,
    finalId: number,
    subject: Subject,
    date: Date,
    grade: number | null = null,
    act: number | null = null,
  ) {
    this.id = id;
    this.finalId = finalId;
    this.subject = subject;
    this.date = date;
    this.grade = (grade === undefined) ? null : grade;
    this.act = (act === undefined) ? null : act;
  }
}
