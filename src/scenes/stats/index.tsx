import { Dimensions } from "react-native";
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getStyleSheet as style } from '../../styles';
import { evaluationsRepository } from '../../repositories';
import { BasicList, MaterialIcon } from '../../components';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../../styles/colorPalette';
import { LineChart } from 'react-native-chart-kit';

interface StatsProps {
  route: any
}

const Stats: React.FC<StatsProps> = ({ route }) => {
  const semester_id = route.params?.semester_id;

  // const fetchSemesterEvaluations = async (): Promise<Evaluation[]> => {
  //   try {
  //     return await evaluationsRepository.fetchSemesterEvaluations(semester_id);
  //   } catch (error) {
  //     console.log('Error', error);
  //     throw error;
  //   }
  // };
  const data = {
    labels: ["2020C2", "2021C1", "2021C2", "2022C1", "2022C2", "2023C1"],
    datasets: [
      {
        data: [6.9, 6.84, 6.94, 7.0, 6.98, 7.05],
        color: (opacity = 1) => lightModeColors.institutional,
        strokeWidth: 2
      }
    ],
    legend: ["Promedio"]
  };

  const listItems = [
    {
      name: "Analisis II",
      materialIcon: <MaterialIcon name="trophy-award" fontSize={24} />
    },
    {
      name: "Taller de Programacion II",
      materialIcon: <MaterialIcon name="trophy-award" fontSize={24} />
    },
    {
      name: "Fisica I",
      materialIcon: <MaterialIcon name="trophy-award" fontSize={24} />
    },
  ]

  const screenWidth = Dimensions.get("window").width - 41;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Progreso Academico</Text>
      <Text style={styles.header2}>Estadisticas basadas en tus notas</Text>

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
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Progress.Circle
              progress={0.75}
              formatText={(a) => 7.5}
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
              progress={0.63}
              formatText={(a) => 6.3}
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
            <Text style={styles.passingGradeText}>Top 3 materias</Text>
            <Text style={styles.passingGradeLabel}>Materias donde sacaste una mejor nota que el promedio global</Text>

          </View>
        </View>
        <BasicList items={listItems} />
      </View>
    </ScrollView>
  );
};

export default Stats;


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
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    gap: 18
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
  passingGradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  passingGradeLabel: {
    fontSize: 14,
    color: 'gray',
  },
});
