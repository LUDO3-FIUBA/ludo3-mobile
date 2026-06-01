export type EntryType = 'class' | 'tp_delivery' | 'exam' | 'holiday' | 'other';

export interface CatedraCalendarLink {
  label: string;
  url: string;
}

export default interface CatedraCalendarEntry {
  id: number;
  semester_id: number;
  date: string;           // 'YYYY-MM-DD'
  class_number: number | null;
  topic: string;
  entry_type: EntryType;
  links: CatedraCalendarLink[];
  notes: string;
}
