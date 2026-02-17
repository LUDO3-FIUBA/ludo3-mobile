import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeacherCommission } from '../models/TeacherCommission';
import { lightModeColors } from '../styles/colorPalette';

export interface CommissionCardProps {
  commission: TeacherCommission;
}

const CommissionCard: React.FC<CommissionCardProps> = ({ commission }) => {
  return (
    <View style={styles.view}>
      <View>
        <Text style={styles.subjectName}>{commission.subjectName.split('-')[0]}</Text>
      </View>
      <View>
        <Text style={styles.catedraName}>{commission.subjectName.split('-')[1]?.trim()}</Text>
      </View>
      <View>
        <Text style={styles.teacherName}>
          Profesor a cargo: {commission.chiefTeacher.firstName} {commission.chiefTeacher.lastName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: lightModeColors.mainColor,
  },
  subjectName: {
    fontSize: 30,
    color: 'white',
  },
  catedraName: {
    color: 'white',
    fontSize: 18,
    marginTop: 3,
  },
  teacherName: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
});

export default CommissionCard;
