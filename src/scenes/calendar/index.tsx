import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { AgendaList, Calendar, CalendarProvider } from 'react-native-calendars';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { Evaluation, FinalExam } from '../../models';
import { calendar as style } from '../../styles';
import { lightModeColors } from '../../styles/colorPalette';
import AgendaItem from './AgendaItem';
import { evaluationsRepository, finalExamsRepository } from '../../repositories';

export type CalendarEvent =
  | { type: 'evaluation'; data: Evaluation }
  | { type: 'final'; data: FinalExam };

interface AgendaSection {
  title: string;
  data: CalendarEvent[];
}

const EVAL_COLOR = lightModeColors.careers;   // naranja
const FINAL_COLOR = '#e53935';                // rojo

const EVAL_DOT = { key: 'evaluation', color: EVAL_COLOR, selectedDotColor: 'white' };
const FINAL_DOT = { key: 'final', color: FINAL_COLOR, selectedDotColor: 'white' };

const CalendarScreen = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [finals, setFinals] = useState<FinalExam[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    evaluationsRepository.fetchMisExamenes().then(setEvaluations).catch(() => {});
    finalExamsRepository.fetchPending().then(setFinals).catch(() => {});
  }, []);

  const calendarItems: AgendaSection[] = useMemo(
    () => getAgendaItems(evaluations, finals),
    [evaluations, finals],
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
    return <AgendaItem item={item} evalColor={EVAL_COLOR} finalColor={FINAL_COLOR} />;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CalendarProvider
        date={startingDate}
        showTodayButton
        theme={{ todayButtonTextColor: lightModeColors.institutional }}
      >
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


function getEventDate(event: CalendarEvent): string {
  if (event.type === 'evaluation') {
    return event.data.end_date.split('T')[0];
  }
  return (typeof event.data.date === 'string' ? event.data.date : event.data.date.toISOString()).split('T')[0];
}

function getAgendaItems(evaluations: Evaluation[], finals: FinalExam[]): AgendaSection[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events: CalendarEvent[] = [
    ...evaluations.map<CalendarEvent>(data => ({ type: 'evaluation', data })),
    ...finals
      .filter(f => new Date(f.date) >= today)
      .map<CalendarEvent>(data => ({ type: 'final', data })),
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
    const hasEval = s.data.some(e => e.type === 'evaluation');
    const hasFinal = s.data.some(e => e.type === 'final');
    const dots = [
      ...(hasEval ? [EVAL_DOT] : []),
      ...(hasFinal ? [FINAL_DOT] : []),
    ];
    marked[s.title] = { dots };
  });
  return marked;
}
