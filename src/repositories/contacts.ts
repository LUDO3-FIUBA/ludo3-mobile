import { get, post, deleteMethod } from './authenticatedRepository';

export interface ContactStudent {
  padron: string;
  full_name: string;
  email: string;
}

export interface Contact {
  id: number;
  contact: ContactStudent;
  status: 'P' | 'A';
  is_sender: boolean;
  created_at: string;
}

export interface ContactSubject {
  subject_name: string;
  subject_siu_id: number;
  semester_id: number;
}

async function fetchContacts(): Promise<Contact[]> {
  const result = await get('api/contacts');
  return Array.isArray(result) ? result as Contact[] : [];
}

async function sendRequest(padron: string): Promise<Contact> {
  return post('api/contacts', { padron }) as Promise<Contact>;
}

async function acceptRequest(contactId: number): Promise<Contact> {
  return post(`api/contacts/${contactId}/accept`, {}) as Promise<Contact>;
}

async function removeContact(contactId: number): Promise<void> {
  await deleteMethod(`api/contacts/${contactId}`, {});
}

async function fetchContactSubjects(contactId: number): Promise<ContactSubject[]> {
  const result = await get(`api/contacts/${contactId}/subjects`);
  return Array.isArray(result) ? result as ContactSubject[] : [];
}

async function searchStudents(query: string): Promise<ContactStudent[]> {
  const result = await get(`api/students/search`, [{ key: 'q', value: query }]);
  return Array.isArray(result) ? result as ContactStudent[] : [];
}

export default { fetchContacts, sendRequest, acceptRequest, removeContact, fetchContactSubjects, searchStudents };
