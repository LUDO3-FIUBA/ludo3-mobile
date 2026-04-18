import React, { useMemo } from 'react';
import { ListRenderItem } from 'react-native';
import { AgendaList, Calendar, CalendarProvider } from 'react-native-calendars';
import { DateData, MarkedDates } from 'react-native-calendars/src/types';
import { lightModeColors } from '../../styles/colorPalette';
import { AgendaSection, CalendarEvent } from './index';

interface Props {
  calendarItems: AgendaSection[];
  marks: MarkedDates;
  selectedDate: string;
  onDayPress: (day: DateData) => void;
  renderItem: ListRenderItem<CalendarEvent>;
  sectionStyle: any;
}

const MonthView = ({
  calendarItems,
  marks,
  selectedDate,
  onDayPress,
  renderItem,
  sectionStyle,
}: Props) => {
  const filteredItems = useMemo(
    () => calendarItems.filter(s => s.title === selectedDate),
    [calendarItems, selectedDate],
  );

  return (
    <CalendarProvider key={selectedDate.substring(0, 7)} date={selectedDate} style={{ flex: 1 }}>
      <Calendar
        firstDay={1}
        current={selectedDate}
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
        sectionStyle={sectionStyle}
      />
    </CalendarProvider>
  );
};

export default MonthView;
