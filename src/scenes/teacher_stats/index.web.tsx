import React, { useEffect, useState } from 'react';
import { Alert, Dimensions } from "react-native";
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Loading } from '../../components';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../../styles/colorPalette';
import { ContributionGraph, LineChart } from 'react-native-chart-kit';
import { SemesterStats } from '../../models/SemesterStats';
import { teacherStatsRepository } from '../../repositories';
import { TeacherSemester } from '../../models/TeacherSemester';
import { MaterialIcon } from '../../components';
import moment from 'moment';

interface StatsProps {
  route: any
}

const Stats: React.FC<StatsProps> = ({ route }) => {
  const semester = route.params.semester as TeacherSemester;

  const [loading, setLoading] = useState(true);
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);

  useEffect(() => {
    fetchData(semester.id);
  }, [semester]);

  const fetchData = async (semesterId: number) => {
    setLoading(true);
    setSemesterStats(null);
    try {
      const fetchedStats = await teacherStatsRepository.fetchSemesterStats(semesterId);
      setLoading(false);
      setSemesterStats(fetchedStats);
    } catch (error) {
      setLoading(false);
      console.log('Error', error);
      Alert.alert(
        '¿Qué pasó?',
        'No sabemos pero no pudimos buscar tu información. ' +
        'Volvé a intentar en unos minutos.'
      );
    }
  };

  const semesterAverageData = {
    labels: semesterStats?.semester_average.map(item => getYearDashMoment(item.year, item.year_moment)),
    datasets: [
      {
        data: semesterStats?.semester_average.map(item => item.average),
        color: (opacity = 1) => lightModeColors.institutional,
        strokeWidth: 2
      }
    ],
    legend: ["Promedio (año-cuatrimestre)"]
  };

  const screenWidth = Dimensions.get("window").width - 41;

  const contributionNumberOfDays = getNumDaysToShow(semesterStats?.desertions[0]?.date) || 1;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Métricas del cuatrimestre actual</Text>
      <Text style={styles.header2}>{semester.commission.subjectName}</Text>

      {loading && <Loading />}
      {!loading && semesterStats && (
        <>
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <MaterialIcon name="chart-line" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.passingGradeText}>Promedio del curso</Text>
                <Text style={styles.passingGradeLabel}>Basado en las notas de evaluaciones {`\n`}parciales de los últimos cuatrimestres</Text>
              </View>
            </View>
            {semesterStats?.semester_average.length ? <LineChart
              data={semesterAverageData}
              width={screenWidth}
              height={220}
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                fillShadowGradientFrom: "#4D4D4D",
                fillShadowGradientTo: "#FFFFFF",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              bezier
              style={styles.semesterAverageData}
            /> : <Text style={[styles.noDataText, styles.semesterAverageData]}>Aún no hay datos de evaluaciones</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.cardItem}>
              <MaterialIcon name="account-arrow-down" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.passingGradeText}>Estimación en deserciones</Text>
                <Text style={styles.passingGradeLabel}>Para cada día se contabiliza la cantidad de alumnos que dejaron de asistir a clases</Text>
              </View>
            </View>
            <View style={{ marginVertical: 10, overflow: 'scroll' }}>
              <ContributionGraph
                values={semesterStats?.desertions}
                accessor='students_deserted'
                numDays={contributionNumberOfDays}
                width={screenWidth}
                horizontal={true}
                height={160}
                chartConfig={{
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 136, 204, ${(opacity - 0.13) * 4})`,
                  labelColor: () => `black`,
                }}
                showMonthLabels={true}
                getMonthLabel={(monthIndex: number) => moment().month(monthIndex).format('MMM')}
              />
            </View>
          </View>

          <View style={[styles.card, { marginBottom: 120 }]}>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, padding: 16 }}>
              <Progress.Circle
                progress={semesterStats.attendance_rate}
                formatText={(a) => getAttendancePercentage(semesterStats.attendance_rate) + '%'}
                color={lightModeColors.institutional}
                unfilledColor='lightblue'
                strokeCap='round'
                size={120}
                thickness={10}
                showsText={true}
                borderWidth={0}
                textStyle={{ fontWeight: 'bold' }}
              />
              <Text style={styles.passingGradeLabel}>Tasa de Asistencia actual</Text>
            </View>
          </View>
        </>
      )}

    </ScrollView>
  );
};

export default Stats;


function getNumDaysToShow(date: string | undefined): number {
  const MINIMUM_DAYS_TO_SHOW = 50;
  const EXTRA_STARTING_PADDING = 10;
  return Math.max(getDaysFromToday(date), MINIMUM_DAYS_TO_SHOW) + EXTRA_STARTING_PADDING;
}

function getDaysFromToday(date: string | undefined): number {
  const givenDate = moment(date);
  const today = moment();
  return today.diff(givenDate, 'days') + 2;
}

function getYearDashMoment(year: number, yearMoment: string): string {
  const lastYearDigits = year % 100;
  let cuatrimestre = ''
  switch (yearMoment) {
    case 'FS': {
      cuatrimestre = '1C'
      break;
    }
    case 'SS': {
      cuatrimestre = '2C'
      break;
    }
  }
  return `${lastYearDigits}-${cuatrimestre}`;
}

function getAttendancePercentage(averageFloat?: number): string {
  if (!averageFloat) {
    return '—'
  }

  return (averageFloat * 100).toFixed(2);
}

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
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardText: {
    color: 'gray',
  },
  passingGradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  passingGradeLabel: {
    fontSize: 14,
    color: 'gray',
  },
  separator: { borderWidth: 0.25, opacity: 0.5 },
  itemText: { fontSize: 18 },
  percentText: { color: 'green' },
  noDataText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
  semesterAverageData: {
    marginBottom: 18,
    borderRadius: 16
  }
});
