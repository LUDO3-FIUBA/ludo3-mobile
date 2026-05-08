import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSemesterAttendances, fetchSemesterDataAsync, selectSemesterAttendances, selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { ClassAttendance } from '../../models/ClassAttendance';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';

import moment from 'moment';

const SemesterAttendances: React.FC = () => {
  const dispatch = useAppDispatch();
  const attendances = useAppSelector(selectSemesterAttendances);
  const semesterData = useAppSelector(selectSemesterData);
  const navigation = useNavigation<any>();

  const onPressAddNewClass = () => {
    navigation.navigate('SemesterAttendanceQR', {});
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Asistencias del cuatrimestre',
      headerRight: () => (
        <TouchableOpacity style={styles.navButton} onPress={onPressAddNewClass}>
          <MaterialIcon name="plus" fontSize={24} color='gray' />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      if (semesterData?.id) {
        dispatch(fetchSemesterAttendances(semesterData.id));
      }
    });

    return focusUnsubscribe;
  }, [dispatch, navigation, semesterData?.id]);

  useEffect(() => {
    const beforeRemoveUnsubscribe = navigation.addListener('beforeRemove', () => {
      if (semesterData?.commission?.id) {
        dispatch(fetchSemesterDataAsync(semesterData.commission.id));
      }
    });

    return beforeRemoveUnsubscribe;
  }, [dispatch, navigation, semesterData?.commission?.id]);

  const renderClassAttendance = ({ item }: { item: ClassAttendance }) => (
    <TouchableOpacity onPress={() => navigation.navigate('AttendanceDetails', { classAttendance: item })} style={styles.sessionContainer}>
      <View style={styles.headerRow}>
        <MaterialIcon name="calendar" fontSize={24} color={lightModeColors.institutional} />
        <Text style={styles.sessionHeader}>
          {moment(new Date(item.createdAt)).format('DD/MM/YYYY')}
        </Text>
      </View>
      <Text style={styles.dateText}>
        Horario de validez del QR: {moment(new Date(item.createdAt)).format('HH:mm')} - {moment(new Date(item.expiresAt)).format('HH:mm')}
      </Text>
      <Text style={styles.dateText}>
        Cantidad de asistencias: {item.attendances.length}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={attendances}
        renderItem={renderClassAttendance}
        keyExtractor={(item) => item.qrid}
        ListEmptyComponent={() => <Text style={styles.noDataText}>No hay clases para este cuatrimestre</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  sessionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  viewDetailsText: {
    color: '#007BFF',
    textAlign: 'right',
    marginTop: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  navButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15
  },
});

export default SemesterAttendances;
