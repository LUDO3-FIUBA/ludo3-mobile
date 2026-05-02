import { get, post, postMultipart, deleteMethod, put, patch } from './authenticatedRepository';
import FormProcedureType from '../models/FormProcedureType';
import Form from '../models/Form';
import FormDetail from '../models/FormDetail';
import FormSubmission, { FormSubmissionStatusValue } from '../models/FormSubmission';

const BASE = 'api';

export type LocalFile = { uri: string; name: string; type: string; file?: File };

function appendField(fd: FormData, key: string, value: unknown) {
  if (value === null || value === undefined) return;
  if (typeof value === 'object') {
    fd.append(key, JSON.stringify(value));
  } else {
    fd.append(key, String(value));
  }
}

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

export async function submitDigitalFormWithAdjunto(
  formId: number,
  answers: { field_id: number; answer_value: string | null }[],
  adjuntoFile: LocalFile,
): Promise<void> {
  const fd = new FormData();
  fd.append('answers', JSON.stringify(answers));
  // Missing Cloud Storage Support
  if (adjuntoFile.file) {
    // Web (Expo web / browser): use the native browser File object.
    fd.append('file', adjuntoFile.file, adjuntoFile.name);
  } else {
    // React Native (iOS / Android): use { uri, name, type } workaround.
    fd.append('file', { uri: adjuntoFile.uri, name: adjuntoFile.name, type: adjuntoFile.type } as unknown as Blob);
  }
  await postMultipart(`${BASE}/forms/${formId}/submissions`, fd);
}

export async function submitDocumentForm(formId: number, file: LocalFile): Promise<FormSubmission> {
  const fd = new FormData();
  // Missing Cloud Storage Support
  if (file.file) {
    // Web (Expo web / browser): expo-document-picker returns a native File object.
    // FormData.append accepts File directly and builds the correct multipart body.
    fd.append('file', file.file, file.name);
  } else {
    // React Native (iOS / Android): FormData.append requires { uri, name, type }.
    // Casting to Blob is the RN-specific workaround; the native layer handles serialization.
    fd.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  }
  return (await postMultipart(`${BASE}/forms/${formId}/submissions/document`, fd)) as FormSubmission;
}

export async function fetchFormSubmissions(formId: number): Promise<FormSubmission[]> {
  return (await get(`${BASE}/forms/${formId}/submissions`)) as FormSubmission[];
}

export async function fetchMyFormSubmissions(formId: number): Promise<FormSubmission[]> {
  return (await get(`${BASE}/forms/${formId}/submissions/my_submissions`)) as FormSubmission[];
}

export async function updateSubmissionStatus(
  submissionId: number,
  status: FormSubmissionStatusValue,
): Promise<FormSubmission> {
  return (await patch(`${BASE}/submissions/${submissionId}/status`, { status })) as FormSubmission;
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

export async function createFormWithTemplate(
  formData: Record<string, unknown>,
  templateFile: LocalFile,
): Promise<Form> {
  const fd = new FormData();
  Object.entries(formData).forEach(([k, v]) => appendField(fd, k, v));
  // Missing Cloud Storage Support
  if (templateFile.file) {
    // Web (Expo web / browser): use the native browser File object.
    fd.append('document_source_file', templateFile.file, templateFile.name);
  } else {
    // React Native (iOS / Android): use { uri, name, type } workaround.
    fd.append('document_source_file', templateFile as unknown as Blob);
  }
  return (await postMultipart(`${BASE}/forms`, fd)) as Form;
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
  submitDigitalFormWithAdjunto,
  submitDocumentForm,
  fetchFormSubmissions,
  fetchMyFormSubmissions,
  updateSubmissionStatus,
  deleteForm,
  deleteSubmission,
  createForm,
  createFormWithTemplate,
  updateForm,
  fetchFieldTypes,
  fetchCatalogs,
  createCatalog,
};
