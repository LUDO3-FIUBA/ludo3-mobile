import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import { MaterialIcon } from '../../components';
import { FinalExam } from '../../models';
import { lightModeColors } from '../../styles/colorPalette';

const FINAL_COLOR = '#e53935';
const PASSING_GRADE = 4;

const ViewFinalDetailsScreen = ({ route }: { route: any }) => {
  const { finalExam }: { finalExam: FinalExam } = route.params;
  const date = moment(finalExam.date);
  const grade = finalExam.grade ?? 0;
  const isGraded = finalExam.grade != null;
  const passed = isGraded && grade >= PASSING_GRADE;
  const failed = isGraded && grade < PASSING_GRADE;

  const statusLabel = !isGraded ? 'Inscripto' : passed ? 'Aprobado' : 'Desaprobado';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Final · {finalExam.subject.name}</Text>
      <Text style={styles.header2}>{finalExam.subject.code}</Text>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-clock" fontSize={24} color={FINAL_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>Fecha</Text>
            <Text style={styles.cardText}>{date.format('DD/MM/YYYY [a las] HH:mm')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="account-tie" fontSize={24} color={FINAL_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>Docente</Text>
            <Text style={styles.cardText}>{finalExam.subject.professor || '–'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="information-outline" fontSize={24} color={FINAL_COLOR} style={{ marginRight: 10 }} />
          <View>
            <Text style={[styles.statusText, { color: failed ? lightModeColors.menuOption : FINAL_COLOR }]}>
              {statusLabel}
            </Text>
            <Text style={styles.cardSubtext}>Estado</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { marginBottom: 120 }]}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Progress.Circle
            progress={isGraded ? grade / 10 : 0}
            formatText={() => isGraded ? String(grade) : '–'}
            color={failed ? lightModeColors.menuOption : FINAL_COLOR}
            unfilledColor='#ffcdd2'
            strokeCap='round'
            size={135}
            thickness={12}
            showsText={true}
            borderWidth={0}
            textStyle={{ fontWeight: 'bold' }}
          />
          <Text style={styles.cardSubtext}>Nota obtenida</Text>
        </View>
        <Text style={styles.cardSubtext}>Nota mínima de aprobación: {PASSING_GRADE}</Text>
      </View>
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
    marginBottom: 18,
    color: 'gray',
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
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtext: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ViewFinalDetailsScreen;
