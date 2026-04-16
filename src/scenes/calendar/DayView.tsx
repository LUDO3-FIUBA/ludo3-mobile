import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { lightModeColors } from '../../styles/colorPalette';
import { AgendaSection, CalendarEvent } from './index';

const EVAL_COLOR  = lightModeColors.careers;
const FINAL_COLOR = '#e53935';
const CLASS_COLOR = '#6640ff';

const START_HOUR  = 7;
const END_HOUR    = 23;
const HOUR_HEIGHT = 64;
const HOURS       = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

interface Props {
  calendarItems: AgendaSection[];
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  onEventPress: (event: CalendarEvent) => void;
}

// ─── time helpers ─────────────────────────────────────────────────────────────

function parseTime(timeStr: string): { h: number; m: number } {
  // handles "17:00:00" or "17:00"
  const parts = timeStr.split(':');
  return { h: parseInt(parts[0], 10), m: parseInt(parts[1], 10) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getEventTop(event: CalendarEvent): number {
  let h: number;
  let m: number;

  if (event.type === 'class') {
    const t = parseTime(event.data.startTime);
    h = t.h;
    m = t.m;
  } else if (event.type === 'evaluation') {
    const t = parseTime(event.data.end_date.split('T')[1] ?? '00:00:00');
    h = t.h;
    m = t.m;
  } else {
    // final
    const dateVal = event.data.date;
    const dateStr = typeof dateVal === 'string' ? dateVal : (dateVal as Date).toISOString();
    const timePart = dateStr.includes('T') ? dateStr.split('T')[1] : '00:00:00';
    const t = parseTime(timePart);
    h = t.h;
    m = t.m;
  }

  const rawTop = (h - START_HOUR + m / 60) * HOUR_HEIGHT;
  return clamp(rawTop, 0, GRID_HEIGHT - 44);
}

function getEventHeight(event: CalendarEvent): number {
  if (event.type !== 'class') return 44;

  const start = parseTime(event.data.startTime);
  const end   = parseTime(event.data.endTime);
  const durationHours = (end.h * 60 + end.m - (start.h * 60 + start.m)) / 60;
  const height = durationHours * HOUR_HEIGHT;
  return Math.max(height, 40);
}

function getEventTime(event: CalendarEvent): string {
  if (event.type === 'class') {
    return event.data.startTime.slice(0, 5);
  }
  if (event.type === 'evaluation') {
    const timePart = event.data.end_date.split('T')[1] ?? '00:00:00';
    return timePart.slice(0, 5);
  }
  // final
  const dateVal = event.data.date;
  const dateStr = typeof dateVal === 'string' ? dateVal : (dateVal as Date).toISOString();
  const timePart = dateStr.includes('T') ? dateStr.split('T')[1] : '00:00:00';
  return timePart.slice(0, 5);
}

// ─── event block components ───────────────────────────────────────────────────

interface EventBlockProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
}

const EventBlock = ({ event, onPress }: EventBlockProps) => {
  const top    = getEventTop(event);
  const height = getEventHeight(event);

  if (event.type === 'class') {
    const startStr = event.data.startTime.slice(0, 5);
    const endStr   = event.data.endTime.slice(0, 5);
    return (
      <TouchableOpacity
        style={[
          styles.eventBlock,
          {
            top,
            height,
            backgroundColor: CLASS_COLOR + '33', // ~20% opacity
            borderLeftColor: CLASS_COLOR,
          },
        ]}
        onPress={() => onPress(event)}
        activeOpacity={0.7}
      >
        <Text style={[styles.eventBlockTitle, { color: CLASS_COLOR }]} numberOfLines={2}>
          {event.data.subjectName}
        </Text>
        <Text style={[styles.eventBlockTime, { color: CLASS_COLOR }]}>
          {startStr} – {endStr}
        </Text>
      </TouchableOpacity>
    );
  }

  if (event.type === 'evaluation') {
    return (
      <TouchableOpacity
        style={[
          styles.eventChip,
          { top, backgroundColor: EVAL_COLOR + '22', borderLeftColor: EVAL_COLOR },
        ]}
        onPress={() => onPress(event)}
        activeOpacity={0.7}
      >
        <Text style={[styles.eventChipTitle, { color: EVAL_COLOR }]} numberOfLines={1}>
          {event.data.evaluation_name}
        </Text>
        <Text style={[styles.eventChipTime, { color: EVAL_COLOR }]}>
          {getEventTime(event)}
        </Text>
      </TouchableOpacity>
    );
  }

  // final
  return (
    <TouchableOpacity
      style={[
        styles.eventChip,
        { top, backgroundColor: FINAL_COLOR + '22', borderLeftColor: FINAL_COLOR },
      ]}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <Text style={[styles.eventChipTitle, { color: FINAL_COLOR }]} numberOfLines={1}>
        Final · {event.data.subject.name}
      </Text>
      <Text style={[styles.eventChipTime, { color: FINAL_COLOR }]}>
        {getEventTime(event)}
      </Text>
    </TouchableOpacity>
  );
};

// ─── DayView ──────────────────────────────────────────────────────────────────

const DayView = ({ calendarItems, selectedDate, onDateChange, onEventPress }: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  const daySection = useMemo(
    () => calendarItems.find(s => s.title === selectedDate),
    [calendarItems, selectedDate],
  );

  const events = daySection?.data ?? [];

  // Auto-scroll to first event or to 7:00
  useEffect(() => {
    let scrollY = 0; // 7:00 is at top

    if (events.length > 0) {
      const tops = events.map(e => getEventTop({ ...e } as CalendarEvent));
      const minTop = Math.min(...tops);
      scrollY = Math.max(0, minTop - 16); // small padding above first event
    }

    // Small delay to ensure ScrollView has rendered
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollY, animated: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  const goToPrevDay = useCallback(() => {
    const prev = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    onDateChange(prev);
  }, [selectedDate, onDateChange]);

  const goToNextDay = useCallback(() => {
    const next = moment(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    onDateChange(next);
  }, [selectedDate, onDateChange]);

  const dayLabel = moment(selectedDate).format('ddd. D MMM.');

  return (
    <View style={styles.container}>
      {/* Day navigation header */}
      <View style={styles.dayNav}>
        <TouchableOpacity
          onPress={goToPrevDay}
          style={styles.navArrowBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.dayNavLabel}>{dayLabel}</Text>
        <TouchableOpacity
          onPress={goToNextDay}
          style={styles.navArrowBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.navArrow}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {/* Time grid */}
      <ScrollView ref={scrollRef} style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Hour rows */}
          {HOURS.map((hour, idx) => (
            <View key={hour} style={styles.hourRow}>
              {/* Left label column */}
              <View style={styles.hourLabelCol}>
                {/* Only show label for hours that start a slot (not the last end line) */}
                {idx < HOURS.length && (
                  <Text style={styles.hourLabel}>{`${hour}:00`}</Text>
                )}
              </View>
              {/* Right grid line area */}
              <View style={styles.hourLineArea}>
                <View style={styles.hourLine} />
              </View>
            </View>
          ))}

          {/* Events overlay */}
          <View style={styles.eventsOverlay}>
            {events.map((event, idx) => (
              <EventBlock key={idx} event={event} onPress={onEventPress} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DayView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // ── day nav ──
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navArrowBtn: {
    padding: 4,
  },
  navArrow: {
    fontSize: 28,
    color: lightModeColors.institutional,
    lineHeight: 32,
  },
  dayNavLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: lightModeColors.darkGray,
    textTransform: 'capitalize',
  },

  // ── grid ──
  gridScroll: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'column',
    paddingBottom: 24,
  },
  hourRow: {
    height: HOUR_HEIGHT,
    flexDirection: 'row',
  },
  hourLabelCol: {
    width: 48,
    alignItems: 'flex-end',
    paddingRight: 8,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  hourLabel: {
    fontSize: 11,
    color: '#aaa',
    marginTop: -6, // visually center against the hour line
  },
  hourLineArea: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  hourLine: {
    height: 1,
    backgroundColor: '#ebebeb',
    marginTop: 0,
  },

  // ── events overlay ──
  eventsOverlay: {
    position: 'absolute',
    top: 0,
    left: 48,
    right: 8,
    height: GRID_HEIGHT,
  },
  eventBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderLeftWidth: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventBlockTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventBlockTime: {
    fontSize: 11,
    marginTop: 2,
  },
  eventChip: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    borderLeftWidth: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventChipTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventChipTime: {
    fontSize: 11,
    flexShrink: 0,
  },
});
