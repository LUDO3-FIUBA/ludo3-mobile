export type AcademicCalendarCategory =
  | 'student'
  | 'teacher'
  | 'department'
  | 'career'
  | 'bedelia'
  | 'systems';

export default interface AcademicCalendarEvent {
  id: number;
  name: string;
  start_date: string; // 'YYYY-MM-DD'
  end_date: string;   // 'YYYY-MM-DD'
  category: AcademicCalendarCategory;
  year: number;
}
