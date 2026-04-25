export interface FormAnswer {
  field_id: number;
  field_label: string;
  answer_value: string | null;
}

export default interface FormSubmission {
  submission_id: number;
  student_first_name: string;
  student_last_name: string;
  student_padron: string | null;
  submitted_at: string;
  answers: FormAnswer[];
}
