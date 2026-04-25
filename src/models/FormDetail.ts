import FormProcedureType from './FormProcedureType';
import { FormTypeSummary } from './Form';

export interface FormFieldTypeSummary {
  id: number;
  value: string;
}

export interface FormFieldOption {
  form_option_id: number;
  form_option_value: string;
  form_option_label: string;
}

export interface CatalogItem {
  catalog_item_id: number;
  catalog_item_value: string;
  catalog_item_label: string;
}

export interface FormFieldCatalog {
  catalog_id: number;
  catalog_key: string;
  items: CatalogItem[];
}

export interface FormField {
  form_field_id: number;
  form_field_label: string;
  form_field_type: FormFieldTypeSummary;
  form_field_require: boolean;
  catalog: FormFieldCatalog | null;
  options: FormFieldOption[] | null;
}

export default interface FormDetail {
  form_id: number;
  form_name: string;
  form_description: string;
  form_information: string | null;
  form_procedure: FormProcedureType;
  form_type: FormTypeSummary;
  fields: FormField[];
  document_source: string | null;
}
