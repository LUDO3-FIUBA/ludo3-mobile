import React, { useEffect, useState } from 'react';
import { Alert, Dimensions } from "react-native";
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BasicList, Loading, MaterialIcon } from '../../components';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../../styles/colorPalette';
import { LineChart } from 'react-native-chart-kit';
import { StudentStats } from '../../models';
import { statsRepository } from '../../repositories';
import { BestSubject } from '../../models/StudentStats';

interface StatsProps {
  route: any
}

const Stats: React.FC<StatsProps> = ({ route }) => {

  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setStudentStats(null);
    try {
      const fetchedStats = await statsRepository.fetchStudentStats();
      setLoading(false);
      setStudentStats(fetchedStats);
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

  const data = {
    labels: studentStats?.average_over_time.map(item => item.date) || [],
    datasets: [
      {
        data: studentStats?.average_over_time.map(item => item.average) || [],
        color: (opacity = 1) => lightModeColors.institutional,
        strokeWidth: 2
      }
    ],
    legend: ["Promedio (mes-año)"]
  };

  const listItems = studentStats?.best_subjects.map(item => ({
    name: item.subject,
    materialIcon: <MaterialIcon name="trophy-award" fontSize={24} />,
    rightItem: <Text style={[styles.percentText, styles.itemText]}>{percentToDisplayString(item)}</Text>,
    onPress: buildTopSubjectOnPressAlert(item)
  })) || [];

  const screenWidth = Dimensions.get("window").width - 41;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Progreso Academico</Text>
      <Text style={styles.header2}>Estadisticas basadas en tus notas</Text>

      {loading && <Loading />}
      {!loading && studentStats && (
        <>
          <LineChart
            data={data}
            width={screenWidth}
            height={220}
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
            style={{
              marginBottom: 18,
              borderRadius: 16
            }}
          />

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 16 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Progress.Circle
                  progress={studentStats.student_vs_global_average.student_average / 10}
                  formatText={(a) => floatToFixedDecimal(studentStats.student_vs_global_average.student_average)}
                  color={lightModeColors.institutional}
                  unfilledColor='lightblue'
                  strokeCap='round'
                  size={120}
                  thickness={10}
                  showsText={true}
                  borderWidth={0}
                  textStyle={{ fontWeight: 'bold' }}
                />
                <Text style={styles.passingGradeLabel}>Tu Promedio</Text>
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Progress.Circle
                  progress={studentStats.student_vs_global_average.global_average / 10}
                  formatText={(a) => floatToFixedDecimal(studentStats.student_vs_global_average.global_average)}
                  color={lightModeColors.institutional}
                  unfilledColor='lightblue'
                  strokeCap='round'
                  size={120}
                  thickness={10}
                  showsText={true}
                  borderWidth={0}
                  textStyle={{ fontWeight: 'bold' }}
                />
                <Text style={styles.passingGradeLabel}>Promedio Global</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { marginBottom: 120 }]}>
            <View style={styles.cardItem}>
              <MaterialIcon name="trophy" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.passingGradeText}>Top materias</Text>
                <Text style={styles.passingGradeLabel}>Materias donde sacaste una mejor nota que el promedio global</Text>

              </View>
            </View>
            <BasicList items={listItems} showSeparator={false} />
          </View>
        </>
      )}

    </ScrollView>
  );
};

export default Stats;

function floatToFixedDecimal(averageFloat: number): string {
  return averageFloat.toFixed(2);
}

function buildTopSubjectOnPressAlert(bestSubjectInfo: BestSubject): () => void {
  return () => Alert.alert(
    bestSubjectInfo.subject,
    `Tu promedio en esta materia fue de ${bestSubjectInfo.grade} mientras que ` +
    `el promedio global esta en ${bestSubjectInfo.subject_average}.\n\n` +
    `Significa que te fue un ${percentToDisplayString(bestSubjectInfo)} mejor que al resto!`
  );
}

function percentToDisplayString(bestSubjectInfo: BestSubject): string {
  const percentIncrease = (bestSubjectInfo.grade - bestSubjectInfo.subject_average) / bestSubjectInfo.subject_average;
  const roundedPercent = Math.round(percentIncrease * 100);
  return `+${roundedPercent}%`;
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
});
