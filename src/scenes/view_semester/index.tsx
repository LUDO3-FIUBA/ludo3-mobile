import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { BasicList, MaterialIcon } from '../../components';
import { Semester } from '../../models';
import { useNavigation } from '@react-navigation/native';
import { lightModeColors } from '../../styles/colorPalette';
import IsPassingCard from '../../components/isPassingCard';


const ViewSemesterScreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation<any>()
  const semester: Semester = route.params.semester;
  const commission = semester.commission

  const listItems = [
    {
      name: "Ver mis asistencias",
      onPress: () => {
        navigation.navigate('MyAttendances', {
          semesterId: semester.id,
          maxAbsences: semester.max_absences,
        });
      },
      materialIcon: <MaterialIcon name="calendar-check" fontSize={24} />
    },
    {
      name: "Ver mis entregas",
      onPress: () => {
        navigation.navigate('MySubmissions', {
          semesterId: semester.id,
        });
      },
      materialIcon: <MaterialIcon name="file-document" fontSize={24} />
    },
    {
      name: "Ver Evaluaciones",
      onPress: () => {
        navigation.navigate('ViewEvaluations', {
          semester_id: semester.id,
        });
      },
      materialIcon: <MaterialIcon name="note-multiple" fontSize={24} />
    },
    {
      name: "Cuerpo Docente",
      onPress: () => {
        navigation.navigate('Teachers', {
          commissionId: commission.id, // Used to get the staff teachers
          chiefTeacher: semester?.commission.chief_teacher, // pass the chief teacher from the semester
        });
      },
      materialIcon: <MaterialIcon name="account-group" fontSize={24} />
    },
    {
      name: "Ver Correlativas",
      onPress: () => {
        navigation.navigate('CorrelativeSubjects', {
          id: semester.commission.subject_siu_id,
        });
      },
      materialIcon: <MaterialIcon name="graph-outline" fontSize={24} />
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{commission.subject_name}</Text>
      <Text style={styles.header2}>{commission.chief_teacher.first_name} {commission.chief_teacher.last_name}</Text>
      <IsPassingCard semesterId={semester.id} />
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <BasicList items={listItems} />
        </View>
      </View>
    </SafeAreaView >
  );
};

export default ViewSemesterScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  header2: {
    fontSize: 20,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    gap: 18
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cardText: {
    color: 'gray',
  },
  passingGradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightModeColors.institutional,
  },
  passingGradeLabel: {
    fontSize: 14,
    color: 'gray',
  },
});
