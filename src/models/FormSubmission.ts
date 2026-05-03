export interface FormAnswer {
  field_id: number;
  field_label: string;
  answer_value: string | null;
}

export type FormSubmissionStatusValue = 'sent' | 'pending_approval' | 'approved' | 'denied';
export type TeacherValidationStatusValue = 'pending' | 'approved' | 'denied';

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
  form_id: number;
  form_name: string;
  form_requires_teacher_validation: boolean;
  teacher_id: number | null;
  teacher_first_name: string | null;
  teacher_last_name: string | null;
  teacher_status: TeacherValidationStatusValue | null;
  teacher_comment: string | null;
}
