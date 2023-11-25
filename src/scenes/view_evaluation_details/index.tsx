import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { lightModeColors } from '../../styles/colorPalette';
import moment from 'moment';
import { MaterialIcon } from '../../components';
import { Evaluation } from '../../models';


const EvaluationDetailsScreen = ({ route }) => {
  const { evaluation }: { evaluation: Evaluation } = route.params;
  const endDate = moment(evaluation.end_date).format('HH:mm D/MM/YY');
  const startDate = moment(evaluation.start_date).format('HH:mm D/MM/YY');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{evaluation.evaluation_name}</Text>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-clock" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View style={{ flexGrow: 1 }}>
            <Text style={styles.cardTitle}>Inicio</Text>
            <Text style={styles.cardText}>{evaluation.start_date ? startDate : `–`}</Text>
          </View>
          <MaterialIcon name="chevron-right" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View style={{ flexGrow: .5 }}>
            <Text style={styles.cardTitle}>Fin</Text>
            <Text style={styles.cardText}>{endDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialIcon name="account-supervisor" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.passingGradeText}>Juan Manuel Sirne</Text>
            <Text style={styles.passingGradeLabel}>Corrector</Text>
          </View>
        </View>
        <View style={styles.cardItem}>
          <MaterialIcon name="calendar-edit" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.passingGradeText}>12:34 – 13/11/23</Text>
            <Text style={styles.passingGradeLabel}>Fecha de corrección</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Progress.Circle
            progress={0.6}
            formatText={(a) => '6'}
            color={lightModeColors.institutional}
            unfilledColor='lightblue'
            strokeCap='round'
            size={135}
            thickness={12}
            showsText={true}
            borderWidth={0}
            textStyle={{ fontWeight: 'bold' }}
          />
          <Text style={styles.passingGradeLabel}>Nota obtenida</Text>
        </View>

        <View>
          <Text style={styles.passingGradeLabel}>Nota mínima de aprobación: {evaluation.passing_grade}</Text>
        </View>
      </View>
    </View>
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

export default EvaluationDetailsScreen;
