import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSemesterAttendances, selectSemesterAttendances, selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { ClassAttendance } from '../../models/ClassAttendance';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';
import { teacherQrAttendanceRepository } from '../../repositories';

import moment from 'moment';

const SemesterAttendances: React.FC = () => {
  const dispatch = useAppDispatch();
  const attendances = useAppSelector(selectSemesterAttendances);
  const semesterData = useAppSelector(selectSemesterData);
  const navigation = useNavigation<any>();
  const [alertDialog, setAlertDialog] = useState<{title: string; message: string} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{title: string; message: string; onConfirm: () => void} | null>(null);

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

  const handleDeleteSession = (item: ClassAttendance) => {
    const message = `¿Seguro que querés eliminar la sesión del ${moment(new Date(item.createdAt)).format('DD/MM/YYYY HH:mm')}? Se borrarán todas las asistencias registradas.`;
    const onConfirm = async () => {
      try {
        await teacherQrAttendanceRepository.deleteAttendanceSession(item.qrid);
        if (semesterData?.id) {
          dispatch(fetchSemesterAttendances(semesterData.id));
        }
      } catch {
        setAlertDialog({ title: 'Error', message: 'No se pudo eliminar la sesión. Intentá de nuevo más tarde.' });
      }
    };

    setConfirmDialog({ title: 'Eliminar sesión', message, onConfirm });
  };

  const renderClassAttendance = ({ item }: { item: ClassAttendance }) => (
    <TouchableOpacity onPress={() => navigation.navigate('AttendanceDetails', { classAttendance: item })} style={styles.sessionContainer}>
      <View style={styles.headerRow}>
        <MaterialIcon name="calendar" fontSize={24} color={lightModeColors.institutional} />
        <Text style={styles.sessionHeader}>
          {moment(new Date(item.createdAt)).format('DD/MM/YYYY')}
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSession(item)}>
          <MaterialIcon name="delete" fontSize={22} color="#c0392b" />
        </TouchableOpacity>
      </View>
      <Text style={styles.dateText}>
        {item.mode === 'qr'
          ? `Horario de validez del QR: ${moment(new Date(item.createdAt)).format('HH:mm')} - ${moment(new Date(item.validUntil)).format('HH:mm')}`
          : `QR + Ubicación — válido hasta ${moment(new Date(item.validUntil)).format('HH:mm')}`
        }
      </Text>
      <Text style={styles.dateText}>
        Cantidad de asistencias: {item.attendances.length}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      <AlertDialog
        visible={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        mode="confirm"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => { confirmDialog?.onConfirm(); setConfirmDialog(null); }}
        onCancel={() => setConfirmDialog(null)}
      />
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
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
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
