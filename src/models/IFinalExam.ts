import Subject from "./Subject";

export interface IFinalExam {
  readonly id: number;
  readonly finalId: number;
  readonly subject: Subject;
  readonly date: Date;
  readonly grade?: number | null;
  readonly act?: number | null;
}
