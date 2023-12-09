import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgendaList, CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { Evaluation } from '../../models';
import { calendar as style } from '../../styles';
import { lightModeColors } from '../../styles/colorPalette';
import AgendaItem from './AgendaItem';
import { evaluationsRepository } from '../../repositories';

interface CalendarItem {
  title: string;
  data: Evaluation[];
}

const CalendarScreen = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])

  async function fetch() {
    const evals = await evaluationsRepository.fetchMisExamenes()
    setEvaluations(evals)
  }

  useEffect(() => {
    fetch()
  }, [])

  const calendarItems: CalendarItem[] = useMemo(() => getAgendaItems(evaluations), [evaluations]);
  const marks: MarkedDates = useMemo(() => getMarkedDates(calendarItems), [evaluations]);
  const startingDate = new Date().toISOString();

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={startingDate}
      showTodayButton
      theme={{ todayButtonTextColor: lightModeColors.institutional }}
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
        sections={calendarItems}
        renderItem={renderItem}
        sectionStyle={style().section}
      />
    </CalendarProvider>
  );
};

export default CalendarScreen;


function getAgendaItems(evaluations: Evaluation[]) {
  return evaluations.reduce<CalendarItem[]>((acc, item) => {
    const date = item.end_date.split('T')[0];
    const existingGroup = acc.find(group => group.title === date);

    if (existingGroup) {
      existingGroup.data.push(item);
    } else {
      acc.push({ title: date, data: [item] });
    }

    return acc;
  }, []);
}

function getMarkedDates(items: CalendarItem[]) {
  const marked: MarkedDates = {};

  items.forEach(item => {
    marked[item.title] = { marked: true };
  });

  return marked;
}
