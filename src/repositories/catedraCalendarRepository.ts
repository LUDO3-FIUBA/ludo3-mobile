import { get, put, post } from './authenticatedRepository';
import CatedraCalendarEntry from '../models/CatedraCalendarEntry';

async function fetchBySemester(semesterId: number): Promise<CatedraCalendarEntry[]> {
  const json = await get(`api/semesters/${semesterId}/catedra_calendar`);
  return json as CatedraCalendarEntry[];
}

async function setCalendarUrl(semesterId: number, url: string): Promise<{ calendar_source_url: string }> {
  return put(`api/teacher/semesters/${semesterId}/set_calendar_url`, { url }) as Promise<{ calendar_source_url: string }>;
}

async function syncCalendar(semesterId: number): Promise<{ synced: number; entries: CatedraCalendarEntry[] }> {
  return post(`api/teacher/semesters/${semesterId}/sync_calendar`, {}) as Promise<{ synced: number; entries: CatedraCalendarEntry[] }>;
}

export default { fetchBySemester, setCalendarUrl, syncCalendar };
