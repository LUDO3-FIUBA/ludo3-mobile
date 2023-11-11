import React, { useCallback } from 'react';
import { AgendaList, CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { Evaluation } from '../../models';
import { calendar as style } from '../../styles';
import { lightModeColors } from '../../styles/colorPalette';
import AgendaItem from './AgendaItem';

const ITEMS: { title: string, data: Evaluation[] }[] = getAgendaItems(getEventItems());

const CalendarScreen = () => {
  const marks: MarkedDates = getMarkedDates(ITEMS)
  const startingDate = new Date().toISOString();

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={startingDate}
      showTodayButton
      theme={{todayButtonTextColor: lightModeColors.institutional}}
    >
      <ExpandableCalendar
        firstDay={1}
        markedDates={marks}
        theme={{
          dotColor: lightModeColors.institutional,
          selectedDayBackgroundColor: lightModeColors.institutional,
          arrowColor: lightModeColors.institutional,
          todayTextColor: lightModeColors.institutional
        }}
      />
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        sectionStyle={style().section}
      />
    </CalendarProvider>
  );
};

export default CalendarScreen;

function getAgendaItems(evaluations: Evaluation[]) {
  return evaluations.map((item) => ({ title: item.end_date.split('T')[0], data: [item] }))
}

function getEventItems(): Evaluation[] {
  return [
      { id: 1, evaluation_name: 'Trabajo Practico', end_date: "2023-11-26", passing_grade: 4, start_date: null },
      { id: 2, evaluation_name: 'Parcial', end_date: "2023-12-06", passing_grade: 4, start_date: null },
      { id: 3, evaluation_name: 'Final', end_date: "2023-12-26", passing_grade: 4, start_date: null },
  ]
}

function getMarkedDates(items: { title: string; data: Evaluation[]; }[]) {
  const marked: MarkedDates = {};

  items.forEach(item => {
    marked[item.title] = { marked: true };
  });

  return marked;
}

