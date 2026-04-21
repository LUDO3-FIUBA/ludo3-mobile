import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Loading, MaterialIcon } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';
import { attendanceRepository } from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';
import { MyAttendance } from '../../models/StudentAttendance';

const MyAttendancesScreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<MyAttendance[]>([]);

  const semester = route?.params?.semester;

  useEffect(() => {
    navigation.setOptions({
      title: 'Mis asistencias',
    });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!semester?.id) {
        if (isMounted) {
          setAttendances([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await makeRequest(() => attendanceRepository.getMyAttendances(semester.id), navigation);
        if (isMounted) {
          const sortedAttendances = [...data].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          setAttendances(sortedAttendances);
        }
      } catch (error) {
        console.log('Error fetching my attendances', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigation, semester?.id]);

  const renderAttendance = ({ item }: { item: MyAttendance }) => (
    <View style={[styles.sessionContainer, !item.attended && styles.absentSessionContainer]}>
      <View style={styles.headerRow}>
        <MaterialIcon name="calendar" fontSize={24} color={item.attended ? lightModeColors.institutional : '#dc3545'} />
        <Text style={styles.sessionHeader}>
          {moment(new Date(item.createdAt)).format('DD/MM/YYYY')}
        </Text>
        <View style={styles.statusIconContainer}>
          <MaterialIcon
            name={item.attended ? 'check-circle' : 'close-circle'}
            fontSize={24}
            color={item.attended ? '#28a745' : '#dc3545'}
          />
        </View>
      </View>
      {item.attended && item.submittedAt ? (
        <Text style={styles.dateText}>
          Hora de asistencia: {moment(new Date(item.submittedAt)).format('HH:mm')}
        </Text>
      ) : (
        <Text style={styles.absentText}>Ausente</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={attendances}
          renderItem={renderAttendance}
          keyExtractor={(item, index) => `${item.qrid}-${index}`}
          ListEmptyComponent={() => (
            <Text style={styles.noDataText}>No hay asistencias registradas para este cuatrimestre</Text>
          )}
        />
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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default MyAttendancesScreen;