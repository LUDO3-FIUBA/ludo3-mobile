import React, { useMemo } from 'react';
import {
  ListRenderItem,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { MarkedDates } from 'react-native-calendars/src/types';
import { lightModeColors } from '../../styles/colorPalette';
import { AgendaSection, CalendarEvent } from './index';

// Priority order for dot color: final > eval > class
const EVAL_COLOR  = lightModeColors.careers;
const FINAL_COLOR = '#e53935';
const CLASS_COLOR = '#6640ff';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface Props {
  calendarItems: AgendaSection[];
  marks: MarkedDates;
  selectedDate: string;
  onDayPress: (dateStr: string) => void;
  renderItem: ListRenderItem<CalendarEvent>;
}

function getWeekDays(dateStr: string): moment.Moment[] {
  const weekStart = moment(dateStr).startOf('isoWeek'); // Monday
  return Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, 'days'));
}

function getDotColor(section: AgendaSection | undefined): string | null {
  if (!section) return null;
  const hasFinal = section.data.some(e => e.type === 'final');
  if (hasFinal) return FINAL_COLOR;
  const hasEval = section.data.some(e => e.type === 'evaluation');
  if (hasEval) return EVAL_COLOR;
  const hasClass = section.data.some(e => e.type === 'class');
  if (hasClass) return CLASS_COLOR;
  return null;
}

function formatSectionHeader(dateStr: string): string {
  return moment(dateStr).format('dddd, D [de] MMMM');
}

const WeekView = ({
  calendarItems,
  selectedDate,
  onDayPress,
  renderItem,
}: Props) => {
  const today = moment().format('YYYY-MM-DD');

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const weekStart = weekDays[0].format('YYYY-MM-DD');
  const weekEnd   = weekDays[6].format('YYYY-MM-DD');

  const weekSections: AgendaSection[] = useMemo(
    () => calendarItems.filter(s => s.title >= weekStart && s.title <= weekEnd),
    [calendarItems, weekStart, weekEnd],
  );

  const sectionMap = useMemo(() => {
    const map: Record<string, AgendaSection> = {};
    calendarItems.forEach(s => { map[s.title] = s; });
    return map;
  }, [calendarItems]);

  const goToPrevWeek = () => {
    const newDate = moment(selectedDate).subtract(7, 'days').format('YYYY-MM-DD');
    onDayPress(newDate);
  };

  const goToNextWeek = () => {
    const newDate = moment(selectedDate).add(7, 'days').format('YYYY-MM-DD');
    onDayPress(newDate);
  };

  return (
    <View style={styles.container}>
      {/* Week strip */}
      <View style={styles.weekStrip}>
        <TouchableOpacity onPress={goToPrevWeek} style={styles.arrowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.arrowText}>{'‹'}</Text>
        </TouchableOpacity>

        {weekDays.map((day, idx) => {
          const dateStr = day.format('YYYY-MM-DD');
          const isSelected = dateStr === selectedDate;
          const isToday    = dateStr === today;
          const dotColor   = getDotColor(sectionMap[dateStr]);

          return (
            <TouchableOpacity
              key={dateStr}
              style={styles.dayColumn}
              onPress={() => onDayPress(dateStr)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayLabel, isToday && !isSelected && styles.dayLabelToday]}>
                {DAY_LABELS[idx]}
              </Text>
              <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                <Text style={[
                  styles.dayNumber,
                  isSelected    && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday,
                ]}>
                  {day.date()}
                </Text>
              </View>
              <View style={styles.dotRow}>
                {dotColor ? (
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={goToNextWeek} style={styles.arrowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.arrowText}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {/* Week events list */}
      {weekSections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin eventos esta semana</Text>
        </View>
      ) : (
        <SectionList
          sections={weekSections}
          keyExtractor={(item, index) => `${index}`}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {formatSectionHeader(section.title)}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

export default WeekView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  weekStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  arrowBtn: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: lightModeColors.institutional,
    lineHeight: 32,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: lightModeColors.institutional,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: lightModeColors.institutional,
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  dayNumberSelected: {
    color: 'white',
    fontWeight: '600',
  },
  dayNumberToday: {
    color: lightModeColors.institutional,
    fontWeight: '600',
  },
  dotRow: {
    height: 6,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
  },
});
