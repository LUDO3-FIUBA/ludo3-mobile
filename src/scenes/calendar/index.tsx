import React, { useRef, useCallback } from 'react';
import { calendar as style } from '../../styles';
import { ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar } from 'react-native-calendars';
import AgendaItem from './AgendaItem';
import { EvaluationInstance } from '../../models';
import { ChiefTeacher, Commission, Semester } from '../../models';
import { MarkedDates } from 'react-native-calendars/src/types';
import { lightModeColors } from '../../styles/colorPalette';

const ITEMS: { title: string, data: EvaluationInstance[] }[] = getAgendaItems(getEventItems());

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

function getAgendaItems(evaluations: EvaluationInstance[]) {
  return evaluations.map((item) => ({ title: item.date.toISOString().split('T')[0], data: [item] }))
}


function getEventItems(): EvaluationInstance[] {

  const chiefTeacher: ChiefTeacher = {
    first_name: "Juan Martin",
    last_name: "Sirne",
    dni: "41318038",
    email: "jsirne@fi.uba.ar",
    legajo: "101049"
  };

  const commission: Commission = {
    subject_siu_id: 1,
    subject_name: "Física I - Cátedra 3", // Updated subject name
    chief_teacher: chiefTeacher
  };

  const semester: Semester = {
    year_moment: "FS",
    start_date: new Date("2023-03-10T19:00:00-03:00"),
    commission
  };

  return [
    new EvaluationInstance(1, 'Trabajo Practico', new Date("2023-11-06"), semester),
    new EvaluationInstance(2, 'Parcial', new Date("2023-11-26"), semester),
    new EvaluationInstance(3, 'Final', new Date("2023-12-06"), semester),
    new EvaluationInstance(4, 'Final', new Date("2024-01-06"), semester),
    new EvaluationInstance(5, 'Final', new Date("2024-02-06"), semester),
    new EvaluationInstance(6, 'Final', new Date("2024-03-06"), semester),
    new EvaluationInstance(7, 'Final', new Date("2024-04-06"), semester),
    new EvaluationInstance(8, 'Final', new Date("2024-05-06"), semester),
    new EvaluationInstance(9, 'Final', new Date("2024-06-06"), semester),
    new EvaluationInstance(10, 'Final', new Date("2024-07-06"), semester),
    new EvaluationInstance(11, 'Final', new Date("2024-08-06"), semester),
    new EvaluationInstance(12, 'Final', new Date("2024-09-06"), semester),
    new EvaluationInstance(13, 'Final', new Date("2024-11-06"), semester),
    new EvaluationInstance(14, 'Final', new Date("2024-12-06"), semester),
    new EvaluationInstance(15, 'Final', new Date("2024-12-06"), semester),
    new EvaluationInstance(16, 'Final', new Date("2024-12-06"), semester),
  ]
}
function getMarkedDates(items: { title: string; data: EvaluationInstance[]; }[]) {
  const marked: MarkedDates = {};

  items.forEach(item => {
    marked[item.title] = { marked: true };
  });

  return marked;
}

