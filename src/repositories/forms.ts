import { get, post, deleteMethod, put } from './authenticatedRepository';
import FormProcedureType from '../models/FormProcedureType';
import Form from '../models/Form';
import FormDetail from '../models/FormDetail';
import FormSubmission from '../models/FormSubmission';

const BASE = 'api';

export async function fetchFormTypes(): Promise<{ id: number; value: string }[]> {
  return (await get(`${BASE}/form-types`)) as { id: number; value: string }[];
}

export async function fetchProcedureTypes(): Promise<FormProcedureType[]> {
  return (await get(`${BASE}/form-procedure-types`)) as FormProcedureType[];
}

export async function fetchForms(procedureId?: number): Promise<Form[]> {
  const params = procedureId ? [{ key: 'procedure_id', value: procedureId }] : [];
  return (await get(`${BASE}/forms`, params)) as Form[];
}

export async function fetchFormDetail(formId: number): Promise<FormDetail> {
  return (await get(`${BASE}/forms/${formId}`)) as FormDetail;
}

export async function submitDigitalForm(
  formId: number,
  answers: { field_id: number; answer_value: string | null }[],
): Promise<void> {
  await post(`${BASE}/forms/${formId}/submissions`, { answers });
}

export async function submitDocumentForm(formId: number): Promise<void> {
  // TODO: integrar Firebase Storage — enviar archivo real al endpoint
  await post(`${BASE}/forms/${formId}/submissions/document`, {});
}

export async function fetchFormSubmissions(formId: number): Promise<FormSubmission[]> {
  return (await get(`${BASE}/forms/${formId}/submissions`)) as FormSubmission[];
}

export async function resetFormSubmissions(formId: number): Promise<{ deleted_submissions: number }> {
  return (await post(`${BASE}/forms/${formId}/reset_submissions`, {})) as { deleted_submissions: number };
}

export async function deleteForm(formId: number): Promise<void> {
  await deleteMethod(`${BASE}/forms/${formId}`, {});
}

export async function deleteSubmission(submissionId: number): Promise<void> {
  await deleteMethod(`${BASE}/submissions/${submissionId}`, {});
}

export async function createForm(formData: object): Promise<Form> {
  return (await post(`${BASE}/forms`, formData)) as Form;
}

export async function updateForm(formId: number, formData: object): Promise<Form> {
  return (await put(`${BASE}/forms/${formId}`, formData)) as Form;
}

export async function fetchFieldTypes(): Promise<{ id: number; value: string }[]> {
  return (await get(`${BASE}/form-field-types`)) as { id: number; value: string }[];
}

export async function fetchCatalogs(): Promise<
  { catalog_id: number; catalog_key: string; catalog_name: string }[]
> {
  return (await get(`${BASE}/catalogs`)) as {
    catalog_id: number;
    catalog_key: string;
    catalog_name: string;
  }[];
}

export async function createCatalog(payload: {
  catalog_key: string;
  catalog_name: string;
  catalog_description: string | null;
  items: { catalog_item_value: string; catalog_item_label: string; catalog_item_order?: number }[];
}): Promise<{ catalog_id: number; catalog_key: string; catalog_name: string }> {
  return (await post(`${BASE}/catalogs`, payload)) as {
    catalog_id: number;
    catalog_key: string;
    catalog_name: string;
  };
}

export default {
  fetchFormTypes,
  fetchProcedureTypes,
  fetchForms,
  fetchFormDetail,
  submitDigitalForm,
  submitDocumentForm,
  fetchFormSubmissions,
  resetFormSubmissions,
  deleteForm,
  deleteSubmission,
  createForm,
  updateForm,
  fetchFieldTypes,
  fetchCatalogs,
  createCatalog,
};
