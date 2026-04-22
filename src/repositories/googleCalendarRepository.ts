import Evaluation from '../models/Evaluation';
import FinalExam from '../models/FinalExam';
import { CommissionInscription } from '../models';
import { SemesterSchedule } from '../models/Semester';

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3';
const TIMEZONE = 'America/Argentina/Buenos_Aires';

export interface GCalCalendar {
  id: string;
  summary: string;
}

export async function fetchCalendarList(accessToken: string): Promise<GCalCalendar[]> {
  const res = await fetch(`${GCAL_BASE}/users/me/calendarList?minAccessRole=writer`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`calendarList error ${res.status}`);
  const json = await res.json();
  return (json.items ?? []).map((c: any) => ({ id: c.id, summary: c.summary }));
}

interface GCalDateTimeSlot {
  dateTime: string;
  timeZone: string;
}

interface GCalDateSlot {
  date: string;
}

interface GCalEvent {
  summary: string;
  description?: string;
  start: GCalDateTimeSlot | GCalDateSlot;
  end: GCalDateTimeSlot | GCalDateSlot;
  recurrence?: string[];
  colorId?: string;
}

// RRULE day codes: backend 0=Lun…5=Sab → MO,TU,WE,TH,FR,SA
const RRULE_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** First occurrence of `dayOfWeek` (backend 0=Mon) on or after `from` */
function firstOccurrence(from: Date, dayOfWeek: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  // JS: 0=Sun,1=Mon…6=Sat  →  backend: 0=Mon…5=Sat
  const jsTarget = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
  const diff = (jsTarget - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

async function insertEvent(accessToken: string, calendarId: string, event: GCalEvent): Promise<void> {
  const url = `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${body}`);
  }
}

async function exportEvaluation(accessToken: string, calendarId: string, ev: Evaluation): Promise<void> {
  const endDt = new Date(ev.end_date);
  const startDt = ev.start_date
    ? new Date(ev.start_date)
    : new Date(endDt.getTime() - 60 * 60 * 1000);

  await insertEvent(accessToken, calendarId, {
    summary: `${ev.evaluation_name} · ${ev.semester.commission.subject_name}`,
    description: `Evaluación de ${ev.semester.commission.subject_name}`,
    start: { dateTime: startDt.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: endDt.toISOString(), timeZone: TIMEZONE },
    colorId: '6', // tangerine
  });
}

async function exportFinal(accessToken: string, calendarId: string, final: FinalExam): Promise<void> {
  const d = final.date instanceof Date ? final.date : new Date(final.date as unknown as string);
  const dateStr = d.toISOString().split('T')[0];
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);

  await insertEvent(accessToken, calendarId, {
    summary: `Final · ${final.subject.name}`,
    description: `Examen final de ${final.subject.name} (${final.subject.code})`,
    start: { date: dateStr },
    end: { date: nextDay.toISOString().split('T')[0] },
    colorId: '11', // tomato
  });
}

async function exportClassSchedule(
  accessToken: string,
  calendarId: string,
  inscription: CommissionInscription,
  schedule: SemesterSchedule,
): Promise<void> {
  const semesterStart = new Date(inscription.semester.start_date);
  const until = new Date(semesterStart);
  until.setMonth(until.getMonth() + 6);
  const untilStr = until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const firstDate = firstOccurrence(semesterStart, schedule.day_of_week);
  const [sh, sm] = schedule.start_time.split(':').map(Number);
  const [eh, em] = schedule.end_time.split(':').map(Number);

  const startDt = new Date(firstDate);
  startDt.setHours(sh, sm, 0, 0);
  const endDt = new Date(firstDate);
  endDt.setHours(eh, em, 0, 0);

  const subjectName = inscription.semester.commission.subject_name;

  await insertEvent(accessToken, calendarId, {
    summary: subjectName,
    description: `Cursada de ${subjectName}`,
    start: { dateTime: startDt.toISOString(), timeZone: TIMEZONE },
    end:   { dateTime: endDt.toISOString(),   timeZone: TIMEZONE },
    recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${RRULE_DAYS[schedule.day_of_week]};UNTIL=${untilStr}`],
    colorId: '3', // sage/verde
  });
}

export async function exportAllEvents(
  accessToken: string,
  calendarId: string,
  evaluations: Evaluation[],
  finals: FinalExam[],
  inscriptions: CommissionInscription[],
): Promise<{ exported: number; total: number }> {
  const classTasks = inscriptions.flatMap(ins =>
    (ins.semester.schedules ?? []).map(s => exportClassSchedule(accessToken, calendarId, ins, s)),
  );
  const tasks = [
    ...evaluations.map(ev => exportEvaluation(accessToken, calendarId, ev)),
    ...finals.map(f => exportFinal(accessToken, calendarId, f)),
    ...classTasks,
  ];
  const results = await Promise.allSettled(tasks);
const exported = results.filter(r => r.status === 'fulfilled').length;
  return { exported, total: tasks.length };
}
