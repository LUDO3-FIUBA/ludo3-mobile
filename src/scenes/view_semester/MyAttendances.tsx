import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Loading, MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';
import { attendanceRepository } from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';
import { MyAttendance } from '../../models/StudentAttendance';
import { CAMPUS_NAMES, Campus } from '../../models/ClassAttendance';

const LOCATION_SUBMIT_WINDOW_MS = 10 * 60 * 1000;

const MyAttendancesScreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<MyAttendance[]>([]);

  const semesterId = route?.params?.semesterId;
  const maxAbsences = route?.params?.maxAbsences;

  useEffect(() => {
    navigation.setOptions({
      title: 'Mis asistencias',
    });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    if (!semesterId) {
      setAttendances([]);
      setLoading(false);
      return;
    }

    try {
      const data = await makeRequest(() => attendanceRepository.getMyAttendances(semesterId), navigation);
      const sortedAttendances = [...data].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setAttendances(sortedAttendances);
    } catch (error) {
      console.log('Error fetching my attendances', error);
    } finally {
      setLoading(false);
    }
  }, [navigation, semesterId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshData = async () => {
        setLoading(true);
        await fetchData();
        if (!isActive) return;
      };

      void refreshData();

      return () => {
        isActive = false;
      };
    }, [fetchData]),
  );

  const isValidAttendance = (item: MyAttendance): boolean =>
    item.attended && (item.mode !== 'location' || item.locationValid !== false);

  const absentCount = attendances.filter((attendance) => !isValidAttendance(attendance)).length;
  const remainingAbsences =
    typeof maxAbsences === 'number' ? Math.max(maxAbsences - absentCount, 0) : null;

  const isWithinLocationSubmitWindow = (item: MyAttendance): boolean => {
    const now = new Date();
    const createdAt = new Date(item.createdAt);
    return now >= createdAt && now.getTime() <= createdAt.getTime() + LOCATION_SUBMIT_WINDOW_MS;
  };

  const canSubmitLocation = (item: MyAttendance): boolean => {
    if (item.mode !== 'location') return false;
    if (item.locationValid === true) return false;
    return isWithinLocationSubmitWindow(item);
  };

  const getStatusIcon = (item: MyAttendance) => {
    if (item.mode === 'location' && item.locationValid === false) {
      return { name: 'map-marker-off', color: '#856404' };
    }
    if (isValidAttendance(item)) {
      return { name: 'check-circle', color: '#28a745' };
    }
    return { name: 'close-circle', color: '#dc3545' };
  };

  const renderAttendance = ({ item }: { item: MyAttendance }) => (
    <View style={[
      styles.sessionContainer,
      !isValidAttendance(item) && styles.absentSessionContainer,
      item.mode === 'location' && item.locationValid === false && styles.locationInvalidContainer,
    ]}>
      <View style={styles.headerRow}>
        <MaterialIcon name="calendar" fontSize={24} color={isValidAttendance(item) ? lightModeColors.institutional : '#dc3545'} />
        <Text style={styles.sessionHeader}>
          {moment(new Date(item.createdAt)).format('DD/MM/YYYY')}
        </Text>
        <View style={styles.statusIconContainer}>
          <MaterialIcon
            name={getStatusIcon(item).name}
            fontSize={24}
            color={getStatusIcon(item).color}
          />
        </View>
      </View>
      {item.attended && item.submittedAt ? (
        <>
          <Text style={styles.dateText}>
            Hora de asistencia: {moment(new Date(item.submittedAt)).format('HH:mm')}
          </Text>
          {item.mode === 'location' && item.locationValid === false && (
            <Text style={styles.locationInvalidText}>⚠️ Fuera de ubicación — podés reintentar si seguís dentro de los 10 minutos</Text>
          )}
          {canSubmitLocation(item) && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => navigation.navigate('AttendanceLocationSubmit', {
                sessionId: item.qrid,
                campus: item.campus as Campus,
                createdAt: item.createdAt,
              })}
            >
              <MaterialIcon name="map-marker" fontSize={18} color="#fff" />
              <Text style={styles.locationButtonText}>
                Reintentar ubicación — {item.campus ? CAMPUS_NAMES[item.campus as Campus] : ''}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={styles.absentText}>Ausente</Text>
          {canSubmitLocation(item) && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => navigation.navigate('AttendanceLocationSubmit', {
                sessionId: item.qrid,
                campus: item.campus as Campus,
                createdAt: item.createdAt,
              })}
            >
              <MaterialIcon name="map-marker" fontSize={18} color="#fff" />
              <Text style={styles.locationButtonText}>
                Marcar presencia — {item.campus ? CAMPUS_NAMES[item.campus as Campus] : ''}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <>
          {remainingAbsences !== null && (
            <Text style={styles.remainingAbsencesText}>
              Faltas restantes: {remainingAbsences}
            </Text>
          )}
          <FlatList
            data={attendances}
            renderItem={renderAttendance}
            keyExtractor={(item, index) => `${item.qrid}-${index}`}
            ListEmptyComponent={() => (
              <Text style={styles.noDataText}>No hay asistencias registradas para este cuatrimestre</Text>
            )}
          />
        </>
      )}
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  absentSessionContainer: {
    borderColor: '#dc3545',
  },
  locationInvalidContainer: {
    borderColor: '#ffc107',
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
  statusIconContainer: {
    marginLeft: 'auto',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  absentText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  remainingAbsencesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
    marginBottom: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  locationInvalidText: {
    fontSize: 13,
    color: '#856404',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 6,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyAttendancesScreen;
