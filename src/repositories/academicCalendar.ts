import { get } from './authenticatedRepository';
import AcademicCalendarEvent from '../models/AcademicCalendarEvent';

const domainUrl = 'api/academic_calendar';

async function fetchEvents(year?: number): Promise<AcademicCalendarEvent[]> {
  const params = year ? [{ key: 'year', value: String(year) }] : undefined;
  const json = await get(domainUrl, params);
  return json as AcademicCalendarEvent[];
}

export default { fetchEvents };
