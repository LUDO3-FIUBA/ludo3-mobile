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
          setAttendances(data);
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
    <View style={styles.sessionContainer}>
      <View style={styles.headerRow}>
        <MaterialIcon name="calendar" fontSize={24} color={lightModeColors.institutional} />
        <Text style={styles.sessionHeader}>
          {moment(new Date(item.submittedAt)).format('DD/MM/YYYY')}
        </Text>
      </View>
      <Text style={styles.dateText}>
        Hora de asistencia: {moment(new Date(item.submittedAt)).format('HH:mm')}
      </Text>
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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default MyAttendancesScreen;