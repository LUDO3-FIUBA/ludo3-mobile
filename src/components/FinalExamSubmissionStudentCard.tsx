import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeacherStudent } from '../models/TeacherStudent';

interface Props {
  student: TeacherStudent
}

export function FinalExamSubmissionStudentCard({ student }: Props) {
  return (
    <View style={styles.studentInfo}>
      <Text style={styles.padron}>{student.padron}</Text>
      <Text style={styles.name}>
        {student.lastName}, {student.firstName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  studentInfo: {
    flexDirection: 'column',
    padding: 10,
  },
  padron: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    color: 'gray',
  },
});
