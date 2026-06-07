import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItem, View } from 'react-native';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { CommissionInscription, Evaluation, FinalExam } from '../../models';
import { SemesterSchedule } from '../../models/Semester';
import AcademicCalendarEvent from '../../models/AcademicCalendarEvent';
import CatedraCalendarEntry from '../../models/CatedraCalendarEntry';
import { calendar as style } from '../../styles';
import { lightModeColors } from '../../styles/colorPalette';
import AgendaItem from './AgendaItem';
import { academicCalendarRepository, catedraCalendarRepository, commissionInscriptionsRepository, evaluationsRepository, finalExamsRepository } from '../../repositories';
import ViewModeToggle from './ViewModeToggle';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import ExportToGoogleButton from './ExportToGoogleButton';
import { useNavigation } from '@react-navigation/native';

export type ClassOccurrence = {
  date: Date;
  startTime: string;
  endTime: string;
  subjectName: string;
  semesterId: number;
  inscription: CommissionInscription;
};

export type CalendarEvent =
  | { type: 'evaluation'; data: Evaluation }
  | { type: 'final'; data: FinalExam }
  | { type: 'class'; data: ClassOccurrence }
  | { type: 'institutional'; data: AcademicCalendarEvent }
  | { type: 'catedra'; data: CatedraCalendarEntry; classOccurrence?: ClassOccurrence; inscription?: CommissionInscription };

export interface AgendaSection {
  title: string;
  data: CalendarEvent[];
}

export type ViewMode = 'month' | 'week' | 'day';

const EVAL_COLOR        = lightModeColors.careers;  // naranja
const FINAL_COLOR       = '#e53935';                // rojo
const CLASS_COLOR       = '#6640ff';                // violeta
const INSTITUTIONAL_COLOR = '#0077b6';              // azul FIUBA

const EVAL_DOT          = { key: 'evaluation',   color: EVAL_COLOR,          selectedDotColor: 'white' };
const FINAL_DOT         = { key: 'final',        color: FINAL_COLOR,         selectedDotColor: 'white' };
const CLASS_DOT         = { key: 'class',        color: CLASS_COLOR,         selectedDotColor: 'white' };
const INSTITUTIONAL_DOT = { key: 'institutional', color: INSTITUTIONAL_COLOR, selectedDotColor: 'white' };
// catedra reutiliza el dot de clase — son el mismo concepto, enriquecido
const CATEDRA_DOT       = CLASS_DOT;

const CalendarScreen = () => {
  const navigation = useNavigation<any>();

  const [evaluations, setEvaluations]           = useState<Evaluation[]>([]);
  const [finals, setFinals]                     = useState<FinalExam[]>([]);
  const [inscriptions, setInscriptions]         = useState<CommissionInscription[]>([]);
  const [institutionalEvents, setInstitutional] = useState<AcademicCalendarEvent[]>([]);
  const [catedraEntries, setCatedraEntries]     = useState<CatedraCalendarEntry[]>([]);
  const [showInstitutional, setShowInstitutional] = useState(true);
  const [viewMode, setViewMode]                 = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate]         = useState<string>(
    new Date().toISOString().split('T')[0],
  );

  useEffect(() => {
    evaluationsRepository.fetchMisExamenes().then(setEvaluations).catch(() => {});
    finalExamsRepository.fetchPending().then(setFinals).catch(() => {});
    academicCalendarRepository.fetchEvents(new Date().getFullYear()).then(setInstitutional).catch(() => {});
    commissionInscriptionsRepository.fetchCurrentInscriptions().then(inscrs => {
      setInscriptions(inscrs);
      // Fetchear el calendario de cátedra de cada semestre inscripto
      const semesterIds = [...new Set(inscrs.map(i => i.semester.id))];
      Promise.all(
        semesterIds.map(id => catedraCalendarRepository.fetchBySemester(id).catch(() => [] as CatedraCalendarEntry[]))
      ).then(results => setCatedraEntries(results.flat()));
    }).catch(() => {});
  }, []);

  const calendarItems: AgendaSection[] = useMemo(
    () => getAgendaItems(evaluations, finals, inscriptions, catedraEntries, showInstitutional ? institutionalEvents : []),
    [evaluations, finals, inscriptions, catedraEntries, institutionalEvents, showInstitutional],
  );

  const marks: MarkedDates = useMemo(() => {
    const base = getMarkedDates(calendarItems, showInstitutional ? institutionalEvents : []);
    return {
      ...base,
      [selectedDate]: {
        ...(base[selectedDate] || {}),
        selected: true,
        selectedColor: lightModeColors.institutional,
      },
    };
  }, [calendarItems, institutionalEvents, showInstitutional, selectedDate]);

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const onDayPressStr = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
  }, []);

  const onEventPress = useCallback((event: CalendarEvent) => {
    if (event.type === 'evaluation') {
      navigation.navigate('ViewEvaluationDetails', { evaluation: event.data });
    } else if (event.type === 'final') {
      const d = event.data.date;
      navigation.navigate('ViewFinalDetails', {
        finalExam: { ...event.data, date: d instanceof Date ? d.toISOString() : d },
      });
    } else if (event.type === 'class') {
      navigation.navigate('ViewClassDetails', {
        classOccurrence: { ...event.data, date: event.data.date.toISOString() },
      });
    } else if (event.type === 'catedra') {
      navigation.navigate('ViewCatedraDetails', {
        entry: event.data,
        classOccurrence: event.classOccurrence
          ? { ...event.classOccurrence, date: event.classOccurrence.date.toISOString() }
          : undefined,
        inscription: event.inscription,
      });
    }
  }, [navigation]);

  const renderItem: ListRenderItem<CalendarEvent> = useCallback(({ item }) => {
    return (
      <AgendaItem
        item={item}
        evalColor={EVAL_COLOR}
        finalColor={FINAL_COLOR}
        classColor={CLASS_COLOR}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ViewModeToggle
        mode={viewMode}
        onChange={setViewMode}
        onTodayPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        showInstitutional={showInstitutional}
        onToggleInstitutional={() => setShowInstitutional(v => !v)}
      />
      <ExportToGoogleButton evaluations={evaluations} finals={finals} inscriptions={inscriptions} />

      {viewMode === 'month' && (
        <MonthView
          calendarItems={calendarItems}
          marks={marks}
          selectedDate={selectedDate}
          onDayPress={onDayPress}
          renderItem={renderItem}
          sectionStyle={style().section}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          calendarItems={calendarItems}
          marks={marks}
          selectedDate={selectedDate}
          onDayPress={onDayPressStr}
          renderItem={renderItem}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          calendarItems={calendarItems}
          selectedDate={selectedDate}
          onDateChange={onDayPressStr}
          onEventPress={onEventPress}
          institutionalEvents={showInstitutional ? institutionalEvents : []}
        />
      )}
    </View>
  );
};

export default CalendarScreen;


// ─── helpers ────────────────────────────────────────────────────────────────

export function getEventDate(event: CalendarEvent): string {
  if (event.type === 'evaluation') return event.data.end_date.split('T')[0];
  if (event.type === 'final') {
    const d = event.data.date;
    return (typeof d === 'string' ? d : (d as Date).toISOString()).split('T')[0];
  }
  if (event.type === 'institutional') return event.data.start_date;
  if (event.type === 'catedra') return event.data.date;
  return event.data.date.toISOString().split('T')[0];
}

/** Genera todas las ocurrencias de clase en la ventana [from, to] */
function generateClassOccurrences(
  inscriptions: CommissionInscription[],
  from: Date,
  to: Date,
): ClassOccurrence[] {
  const occurrences: ClassOccurrence[] = [];

  for (const inscription of inscriptions) {
    const schedules: SemesterSchedule[] = inscription.semester.schedules ?? [];
    for (const schedule of schedules) {
      const current = new Date(from);
      current.setHours(0, 0, 0, 0);
      while (current <= to) {
        // JS: 0=Dom,1=Lun…6=Sab → Python/backend: 0=Lun…5=Sab
        const jsDay = current.getDay();
        const backendDay = jsDay === 0 ? 6 : jsDay - 1;
        if (backendDay === schedule.day_of_week) {
          occurrences.push({
            date: new Date(current),
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            subjectName: inscription.semester.commission.subject_name,
            semesterId: inscription.semester.id,
            inscription,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return occurrences;
}

function getAgendaItems(
  evaluations: Evaluation[],
  finals: FinalExam[],
  inscriptions: CommissionInscription[],
  catedraEntries: CatedraCalendarEntry[],
  institutionalEvents: AcademicCalendarEvent[],
): AgendaSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixMonthsOut = new Date(today);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  const classOccurrences = generateClassOccurrences(inscriptions, today, sixMonthsOut);

  // Semestres que tienen al menos un entry de cátedra cargado
  const semestersWithCatedra = new Set(catedraEntries.map(e => e.semester_id));

  // Mapa semesterId → inscription para enriquecer catedra entries sin classOccurrence
  const inscriptionBySemester = new Map<number, CommissionInscription>();
  for (const insc of inscriptions) {
    inscriptionBySemester.set(insc.semester.id, insc);
  }

  // Mapa (semesterId, 'YYYY-MM-DD') → ClassOccurrence para enriquecer catedra entries
  const occurrenceMap = new Map<string, ClassOccurrence>();
  for (const occ of classOccurrences) {
    const key = `${occ.semesterId}:${occ.date.toISOString().split('T')[0]}`;
    occurrenceMap.set(key, occ);
  }

  const events: CalendarEvent[] = [
    ...evaluations.map<CalendarEvent>(data => ({ type: 'evaluation', data })),
    ...finals
      .filter(f => new Date(f.date) >= today)
      .map<CalendarEvent>(data => ({ type: 'final', data })),
    // Catedra entries reemplazan los class genéricos para ese semestre
    ...catedraEntries.map<CalendarEvent>(data => ({
      type: 'catedra',
      data,
      classOccurrence: occurrenceMap.get(`${data.semester_id}:${data.date}`),
      inscription: inscriptionBySemester.get(data.semester_id),
    })),
    // Class occurrences solo para semestres SIN calendario de cátedra
    ...classOccurrences
      .filter(occ => !semestersWithCatedra.has(occ.semesterId))
      .map<CalendarEvent>(data => ({ type: 'class', data })),
    ...institutionalEvents.map<CalendarEvent>(data => ({ type: 'institutional', data })),
  ];

  events.sort((a, b) => {
    const dateA = new Date(getEventDate(a));
    const dateB = new Date(getEventDate(b));
    return dateA.getTime() - dateB.getTime();
  });

  return events.reduce<AgendaSection[]>((acc, event) => {
    const date = getEventDate(event);
    const existing = acc.find(s => s.title === date);
    if (existing) {
      existing.data.push(event);
    } else {
      acc.push({ title: date, data: [event] });
    }
    return acc;
  }, []);
}

function getMarkedDates(sections: AgendaSection[], institutionalEvents: AcademicCalendarEvent[]): MarkedDates {
  const marked: MarkedDates = {};

  sections.forEach(s => {
    const hasEval    = s.data.some(e => e.type === 'evaluation');
    const hasFinal   = s.data.some(e => e.type === 'final');
    const hasClass   = s.data.some(e => e.type === 'class' || e.type === 'catedra');
    const dots = [
      ...(hasEval  ? [EVAL_DOT]    : []),
      ...(hasFinal ? [FINAL_DOT]   : []),
      ...(hasClass ? [CATEDRA_DOT] : []),
    ];
    marked[s.title] = { dots };
  });

  // Mark only start_date of each institutional event
  institutionalEvents.forEach(ev => {
    const dateStr = ev.start_date;
    const existing = marked[dateStr] ?? { dots: [] };
    const dots = existing.dots as any[] ?? [];
    if (!dots.some((d: any) => d.key === 'institutional')) {
      marked[dateStr] = { ...existing, dots: [...dots, INSTITUTIONAL_DOT] };
    }
  });

  return marked;
}
