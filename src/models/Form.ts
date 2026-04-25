import FormProcedureType from './FormProcedureType';

export interface FormTypeSummary {
  id: number;
  value: 'Digital' | 'Documento';
}

export default interface Form {
  form_id: number;
  form_name: string;
  form_description: string;
  form_information?: string | null;
  form_procedure: FormProcedureType;
  form_type: FormTypeSummary;
  created_at: string;
}
