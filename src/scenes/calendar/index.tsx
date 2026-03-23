import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { AgendaList, Calendar, CalendarProvider } from 'react-native-calendars';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { CommissionInscription, Evaluation, FinalExam } from '../../models';
import { SemesterSchedule } from '../../models/Semester';
import { calendar as style } from '../../styles';
import { lightModeColors } from '../../styles/colorPalette';
import AgendaItem from './AgendaItem';
import { commissionInscriptionsRepository, evaluationsRepository, finalExamsRepository } from '../../repositories';

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
  | { type: 'class'; data: ClassOccurrence };

interface AgendaSection {
  title: string;
  data: CalendarEvent[];
}

const EVAL_COLOR  = lightModeColors.careers;  // naranja
const FINAL_COLOR = '#e53935';                // rojo
const CLASS_COLOR = '#6640ff';                // violeta

const EVAL_DOT  = { key: 'evaluation', color: EVAL_COLOR,  selectedDotColor: 'white' };
const FINAL_DOT = { key: 'final',      color: FINAL_COLOR, selectedDotColor: 'white' };
const CLASS_DOT = { key: 'class',      color: CLASS_COLOR, selectedDotColor: 'white' };

const CalendarScreen = () => {
  const [evaluations, setEvaluations]     = useState<Evaluation[]>([]);
  const [finals, setFinals]               = useState<FinalExam[]>([]);
  const [inscriptions, setInscriptions]   = useState<CommissionInscription[]>([]);
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);

  useEffect(() => {
    evaluationsRepository.fetchMisExamenes().then(setEvaluations).catch(() => {});
    finalExamsRepository.fetchPending().then(setFinals).catch(() => {});
    commissionInscriptionsRepository.fetchCurrentInscriptions().then(setInscriptions).catch(() => {});
  }, []);

  const calendarItems: AgendaSection[] = useMemo(
    () => getAgendaItems(evaluations, finals, inscriptions),
    [evaluations, finals, inscriptions],
  );

  const filteredItems = useMemo(() => {
    if (!selectedDate) return calendarItems;
    return calendarItems.filter(s => s.title === selectedDate);
  }, [calendarItems, selectedDate]);

  const marks: MarkedDates = useMemo(() => {
    const base = getMarkedDates(calendarItems);
    if (!selectedDate) return base;
    return {
      ...base,
      [selectedDate]: {
        ...(base[selectedDate] || {}),
        selected: true,
        selectedColor: lightModeColors.institutional,
      },
    };
  }, [calendarItems, selectedDate]);

  const startingDate = new Date().toISOString().split('T')[0];

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(prev => prev === day.dateString ? null : day.dateString);
  }, []);


  const renderItem = useCallback(({ item }: { item: CalendarEvent }) => {
    return <AgendaItem item={item} evalColor={EVAL_COLOR} finalColor={FINAL_COLOR} classColor={CLASS_COLOR} />;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CalendarProvider date={startingDate}>
        <Calendar
          firstDay={1}
          markedDates={marks}
          markingType="multi-dot"
          onDayPress={onDayPress}
          theme={{
            selectedDayBackgroundColor: lightModeColors.institutional,
            arrowColor: lightModeColors.institutional,
            todayTextColor: lightModeColors.institutional,
            monthTextColor: lightModeColors.darkGray,
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
            textMonthFontSize: 16,
          }}
        />
        <AgendaList
          sections={filteredItems}
          renderItem={renderItem}
          sectionStyle={style().section}
        />
      </CalendarProvider>
    </View>
  );
};

export default CalendarScreen;


// ─── helpers ────────────────────────────────────────────────────────────────

function getEventDate(event: CalendarEvent): string {
  if (event.type === 'evaluation') return event.data.end_date.split('T')[0];
  if (event.type === 'final') {
    const d = event.data.date;
    return (typeof d === 'string' ? d : (d as Date).toISOString()).split('T')[0];
  }
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
): AgendaSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixMonthsOut = new Date(today);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  const classOccurrences = generateClassOccurrences(inscriptions, today, sixMonthsOut);

  const events: CalendarEvent[] = [
    ...evaluations.map<CalendarEvent>(data => ({ type: 'evaluation', data })),
    ...finals
      .filter(f => new Date(f.date) >= today)
      .map<CalendarEvent>(data => ({ type: 'final', data })),
    ...classOccurrences.map<CalendarEvent>(data => ({ type: 'class', data })),
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

function getMarkedDates(sections: AgendaSection[]): MarkedDates {
  const marked: MarkedDates = {};
  sections.forEach(s => {
    const hasEval  = s.data.some(e => e.type === 'evaluation');
    const hasFinal = s.data.some(e => e.type === 'final');
    const hasClass = s.data.some(e => e.type === 'class');
    const dots = [
      ...(hasEval  ? [EVAL_DOT]  : []),
      ...(hasFinal ? [FINAL_DOT] : []),
      ...(hasClass ? [CLASS_DOT] : []),
    ];
    marked[s.title] = { dots };
  });
  return marked;
}
