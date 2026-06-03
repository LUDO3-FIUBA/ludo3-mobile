import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, FlatList, Image, StyleSheet, ToastAndroid, TouchableOpacity } from 'react-native';
import { lightModeColors } from '../../styles/colorPalette';
import { Teacher, TeacherTuple, ChiefTeacher } from '../../models';
import { commissionsRepository } from '../../repositories';
import { CopyableEmailText } from '../../components';
import AlertDialog from '../../components/AlertDialog';
const UserIcon = require('./img/usericon.jpg');


const ChiefCard = ({ chief, onViewProfile }: { chief: ChiefTeacher; onViewProfile: (id: number, role: string) => void }) => {
  return (
    <View style={styles.leaderCardContainer}>
      <Image source={UserIcon} style={styles.leaderImage} />
      <View style={styles.leaderInfoContainer}>
        <Text style={styles.leaderName}>{chief.first_name} {chief.last_name}</Text>
        <Text style={styles.leaderRole}>Profesor Titular</Text>
        <CopyableEmailText email={chief.email} />
        <TouchableOpacity onPress={() => onViewProfile(chief.id, 'Profesor Titular')}>
          <Text style={styles.githubLink}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const TeacherCard = ({ teacher, role, onViewProfile }: { teacher: Teacher; role: string; onViewProfile: (id: number, role: string) => void }) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={UserIcon} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{teacher.first_name + ' ' + teacher.last_name} </Text>
        <Text style={styles.role}>{role}</Text>
        <CopyableEmailText email={teacher.email} />
        <TouchableOpacity onPress={() => onViewProfile(teacher.id, role)}>
          <Text style={styles.githubLink}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface TeachersScreenProps {
  route: any;
}

interface TeachersRouteParams {
  commissionId: number;
  chiefTeacher: ChiefTeacher;
}


const TeachersScreen = ({ route }: TeachersScreenProps) => {
  const navigation = useNavigation();
  // const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const commissionId = (route.params as TeachersRouteParams).commissionId;
  const chiefTeacher = (route.params as TeachersRouteParams).chiefTeacher;
  const [staffTeachers, setStaffTeachers] = useState<TeacherTuple[]>([])

  const fetchData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const staffTeachers: TeacherTuple[] = await commissionsRepository.fetchTeachersOfCommission(commissionId);
      console.log('Staff teachers', staffTeachers);
      
      setStaffTeachers(staffTeachers);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
      setAlertDialog({ title: '¿Qué pasó?', message: 'No sabemos pero no pudimos conseguir información acerca del cuatrimestre. Volvé a intentar en unos minutos.' });
      setIsLoading(false);
    }
  }, [isLoading, commissionId]);

  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return focusUnsubscribe;
  }, [])

  const handleViewProfile = (teacherUserId: number, role: string) => {
    (navigation as any).navigate('TeacherProfile', { teacherUserId, role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      {chiefTeacher && <ChiefCard chief={chiefTeacher} onViewProfile={handleViewProfile} />}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Cuerpo docente</Text>
      </View>
      <FlatList
        data={staffTeachers}
        renderItem={({ item }) => (
          <TeacherCard teacher={item.teacher} role={item.role} onViewProfile={handleViewProfile} />
        )}
        keyExtractor={item => item.teacher.dni}
        style={styles.list}
        ListEmptyComponent={() => <Text style={styles.emptyStaffTeachersList}>No hay docentes auxiliares</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  list: {
    margin: 10,
  },
  cardContainer: {
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
    color: lightModeColors.institutional
  },
  role: {
    color: 'gray',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 15, // Adjust as needed
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  teacherCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'grey',
  },
  leaderCardContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // You can change the color as per your UI design
  },
  leaderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 20,
  },
  leaderInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  leaderName: {
    fontWeight: 'bold',
    fontSize: 24,
    color: lightModeColors.institutional
  },
  leaderRole: {
    color: 'gray',
    fontSize: 18,
  },
  emptyStaffTeachersList: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18
  },
  githubLink: {
    color: '#0d1117',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
});

export default TeachersScreen;
