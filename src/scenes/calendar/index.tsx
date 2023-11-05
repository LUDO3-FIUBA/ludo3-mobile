import React, { useRef, useCallback } from 'react';
import { calendar as style } from '../../styles';
import { ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar } from 'react-native-calendars';
import AgendaItem from './AgendaItem';
import { EvaluationInstance } from '../../models';
import { ChiefTeacher, Commission, Semester } from '../../models/EvaluationInstance';
import { MarkedDates } from 'react-native-calendars/src/types';

const ITEMS: { title: Date, data: EvaluationInstance[] }[] = getAgendaItems(getEventItems());
const MARKS = getMarkedDates(ITEMS)

const CalendarScreen = () => {
  const marked = useRef(MARKS);
  const startingDate = new Date().toISOString();

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={startingDate}
      showTodayButton
    >
      <ExpandableCalendar
        firstDay={1}
        markedDates={marked.current}
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

function getAgendaItems(evaluations: EvaluationInstance[]) {
  return evaluations.map((item) => ({ title: item.date, data: [item] }))
}


function getEventItems(): EvaluationInstance[] {

  const chiefTeacher = new ChiefTeacher(
    "Juan Martin",
    "Sirne",
    "41318038",
    "jsirne@fi.uba.ar",
    "101049"
  );

  const commission = new Commission(
    1,
    "Física I - Cátedra 3", // Updated subject name
    chiefTeacher
  );

  const semester = new Semester(
    "FS",
    "2023-03-10T19:00:00-03:00",
    commission
  );

  return [
    new EvaluationInstance(1, 'Trabajo Practico', new Date("2023-09-06"), semester),
    new EvaluationInstance(1, 'Trabajo Practico', new Date("2023-11-06"), semester),
    new EvaluationInstance(2, 'Parcial', new Date("2023-11-26"), semester),
    new EvaluationInstance(3, 'Final', new Date("2023-12-06"), semester)
  ]
}
function getMarkedDates(items: { title: Date; data: EvaluationInstance[]; }[]) {
  const marked: MarkedDates = {};

  items.forEach(item => {
    // NOTE: only mark dates with data
    if (item.data && item.data.length > 0) {
      marked[item.title] = {marked: true, dotColor: 'red', selected: true};
    } else {
      marked[item.title] = {disabled: true};
    }
  });
  return marked;
}

