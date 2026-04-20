import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import { MaterialIcon } from '../../components';
import { ClassOccurrence } from '../calendar';
import { SemesterSchedule } from '../../models/Semester';

const CLASS_COLOR = '#6640ff';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ViewClassDetailsScreen = ({ route }: { route: any }) => {
  const { classOccurrence }: { classOccurrence: ClassOccurrence } = route.params;
  const { inscription } = classOccurrence;
  const { commission } = inscription.semester;
  const teacher = commission.chief_teacher;
  const schedules: SemesterSchedule[] = inscription.semester.schedules ?? [];

  const date = moment(classOccurrence.date);
  const startTime = classOccurrence.startTime.slice(0, 5);
  const endTime   = classOccurrence.endTime.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{commission.subject_name}</Text>
      <Text style={styles.header2}>Cursada</Text>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-today" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>Fecha</Text>
            <Text style={styles.cardText}>{date.format('dddd DD/MM/YYYY')}</Text>
          </View>
        </View>
        <View style={styles.cardItem}>
          <MaterialIcon name="clock-outline" fontSize={24} color={CLASS_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>Horario</Text>
            <Text style={styles.cardText}>{startTime} – {endTime}</Text>
          </View>
        </View>
      </View>

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

      {schedules.length > 0 && (
        <View style={[styles.card, { marginBottom: 120 }]}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

export default ViewClassDetailsScreen;
