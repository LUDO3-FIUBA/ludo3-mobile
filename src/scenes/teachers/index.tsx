import { useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { ChiefTeacher } from '../../models';
import { lightModeColors } from '../../styles/colorPalette';
const UserIcon = require('./img/usericon.jpg');

// Mock data for the teachers
const teachersData = [
  // ... populate with your data
  { id: '1', name: 'Juan Martinez', role: 'Jefe de cátedra', email: 'test@fi.uba.ar', image: UserIcon, isChief: true },
  { id: '2', name: 'Franco Giordano', role: 'Jefe de trabajos prácticos', email: 'test@fi.uba.ar', image: UserIcon },
  { id: '3', name: 'Luis Villagra', role: 'Ayudante', email: 'test@fi.uba.ar', image: UserIcon },
  { id: '4', name: 'Sofia Gonzalez', role: 'Ayudante', email: 'test@fi.uba.ar', image: UserIcon },
  // Add other teacher data
];

interface TeacherCardProps {
  name: string;
  role: string;
  email: string;
  image: any;
}


const ChiefCard = ({ first_name, last_name, email }: ChiefTeacher) => {
  return (
    <View style={styles.leaderCardContainer}>
      <Image source={UserIcon} style={styles.leaderImage} />
      <View style={styles.leaderInfoContainer}>
        <Text style={styles.leaderName}>{first_name} {last_name}</Text>
        <Text style={styles.leaderRole}>{'Jefe de cátedra'}</Text>
      </View>
    </View>
  );
};


const TeacherCard = ({ name, role, email, image }: TeacherCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>
  );
};

const TeachersScreen = () => {
  const route = useRoute();
  console.log("Route params");
  console.log(route.params);
  
  const leader = (route.params as any).teachers.chiefTeacher;

  // When unmocked, used this
  // const teachersWithoutChief = (route.params as any).teachers.staffTeachers;
  const teachersWithoutChief = teachersData.filter(teacher => !teacher.isChief);
  
  return (
    <SafeAreaView style={styles.container}>
      {leader && <ChiefCard {...leader} />}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Cuerpo docente</Text>
      </View>
      <FlatList
        data={teachersWithoutChief}
        renderItem={({ item }) => <TeacherCard {...item} />}
        keyExtractor={item => item.id}
        style={styles.list}
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
  email: {
    color: 'gray',
    fontWeight: 'bold',
    fontStyle: 'italic',
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
});

export default TeachersScreen;
