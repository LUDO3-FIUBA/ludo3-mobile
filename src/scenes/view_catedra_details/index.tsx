import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcon } from '../../components';
import CommissionInscription from '../../models/CommissionInscription';
import CatedraCalendarEntry from '../../models/CatedraCalendarEntry';
import { ClassOccurrence } from '../calendar';
import { SemesterSchedule } from '../../models/Semester';

const CLASS_COLOR = '#6640ff';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ENTRY_TYPE_LABELS: Record<string, string> = {
  class:       'Clase',
  tp_delivery: 'Entrega TP',
  exam:        'Parcial',
  holiday:     'Feriado',
  other:       'Otro',
};

interface RouteParams {
  entry: CatedraCalendarEntry;
  classOccurrence?: ClassOccurrence & { date: string };
  inscription?: CommissionInscription;
}

const ViewCatedraDetailsScreen = ({ route }: { route: any }) => {
  const { entry, classOccurrence, inscription }: RouteParams = route.params;
  const date = moment(entry.date);
  const typeLabel = ENTRY_TYPE_LABELS[entry.entry_type] ?? 'Clase';
  const title = entry.class_number ? `Clase ${entry.class_number}` : typeLabel;

  const resolvedInscription = classOccurrence?.inscription ?? inscription;
  const subjectName = classOccurrence?.subjectName ?? resolvedInscription?.semester?.commission?.subject_name;
  const teacher = resolvedInscription?.semester?.commission?.chief_teacher;
  const schedules: SemesterSchedule[] = resolvedInscription?.semester?.schedules ?? [];

  // Use classOccurrence times if available; otherwise fall back to the inscription schedule
  const fallbackSchedule = (() => {
    if (schedules.length === 0) return undefined;
    const [y, m, d] = entry.date.split('-').map(Number);
    const jsDay = new Date(y, m - 1, d).getDay();
    const backendDay = jsDay === 0 ? 6 : jsDay - 1;
    return schedules.find(s => s.day_of_week === backendDay) ?? schedules[0];
  })();
  const startTime = classOccurrence?.startTime.slice(0, 5) ?? fallbackSchedule?.start_time.slice(0, 5);
  const endTime   = classOccurrence?.endTime.slice(0, 5)   ?? fallbackSchedule?.end_time.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      {subjectName && <Text style={styles.header}>{subjectName}</Text>}
      <Text style={styles.header2}>{title}</Text>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-today" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>Fecha</Text>
            <Text style={styles.cardText}>{date.format('dddd DD/MM/YYYY')}</Text>
          </View>
        </View>
        {startTime && (
          <View style={styles.cardItem}>
            <MaterialIcon name="clock-outline" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.cardTitle}>Horario</Text>
              <Text style={styles.cardText}>{startTime}{endTime ? ` – ${endTime}` : ''}</Text>
            </View>
          </View>
        )}
      </View>

      {teacher && (
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <MaterialIcon name="account-tie" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.cardTitle}>Docente a cargo</Text>
              <Text style={styles.cardText}>{teacher.first_name} {teacher.last_name}</Text>
              <Text style={styles.cardSubtext}>{teacher.email}</Text>
            </View>
          </View>
        </View>
      )}

      {schedules.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <MaterialIcon name="calendar-week" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
            <Text style={styles.cardTitle}>Horario semanal</Text>
          </View>
          {schedules.map(s => (
            <View key={s.id} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>{DAY_NAMES[s.day_of_week] ?? '–'}</Text>
              <Text style={styles.scheduleTime}>
                {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="book-open-outline" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Tema</Text>
            <Text style={styles.cardText}>{entry.topic}</Text>
          </View>
        </View>
        {entry.notes.length > 0 && (
          <View style={styles.cardItem}>
            <MaterialIcon name="text" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Notas</Text>
              <Text style={styles.cardText}>{entry.notes}</Text>
            </View>
          </View>
        )}
      </View>

      {entry.links.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardItem}>
            <Icon name="link-variant" size={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
            <Text style={styles.cardTitle}>Links</Text>
          </View>
          {entry.links.map((link, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.linkRow}
              onPress={() => Linking.openURL(link.url)}
            >
              <Icon name="open-in-new" size={16} color={CLASS_COLOR} style={{ marginRight: 8 }} />
              <Text style={styles.linkText} numberOfLines={1}>{link.label || link.url}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header2: {
    fontSize: 20,
    color: 'gray',
    marginBottom: 18,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardText: {
    color: 'gray',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#aaa',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  linkText: {
    color: CLASS_COLOR,
    fontSize: 14,
    flex: 1,
    textDecorationLine: 'underline',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleDay: {
    fontWeight: '500',
    color: CLASS_COLOR,
    fontSize: 15,
  },
  scheduleTime: {
    color: 'gray',
    fontSize: 15,
  },
});

export default ViewCatedraDetailsScreen;
