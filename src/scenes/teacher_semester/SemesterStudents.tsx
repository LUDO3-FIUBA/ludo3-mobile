import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { TeacherStudent } from '../../models/TeacherStudent';
import { useNavigation } from '@react-navigation/native';
import { SemesterStudentsHeaderRight } from './SemesterStudentsHeaderRight';
const UserIcon = require('./img/usericon.jpg');

const SemesterStudents: React.FC = () => {
  const students = useAppSelector((state) => state.semester.data?.students as TeacherStudent[]);

  const navigation = useNavigation()

  const setNavOptions = useCallback(() => {
    navigation.setOptions({
      title: 'Alumnos del cuatrimestre',
      headerRight: () => <SemesterStudentsHeaderRight />,
    });
  }, [navigation]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      setNavOptions();
    });
    return focusUnsubscribe;
  }, [])

  const renderStudent = ({ item }: { item: TeacherStudent }) => (
      <View style={styles.studentCard}>
      <Image source={UserIcon} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.studentName}>{item.firstName} {item.lastName} </Text>
        <Text style={styles.studentDetail}>Padrón: {item.padron || 'Padrón faltante'}</Text>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alumnos ({students?.length || 0})</Text>
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5', // Light grey background color
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  studentCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4, // Space between name and details
  },
  studentDetail: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 2, // Space between each detail
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default SemesterStudents;
