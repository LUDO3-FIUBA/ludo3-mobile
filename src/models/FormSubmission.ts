export interface FormAnswer {
  field_id: number;
  field_label: string;
  answer_value: string | null;
}

export type FormSubmissionStatusValue = 'sent' | 'pending_approval' | 'approved' | 'denied';

export interface FormSubmissionStatus {
  id: number;
  value: FormSubmissionStatusValue;
}

export default interface FormSubmission {
  submission_id: number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  student_first_name: string;
  student_last_name: string;
  student_padron: string | null;
  submitted_at: string;
  status: FormSubmissionStatus;
  answers: FormAnswer[];
}
