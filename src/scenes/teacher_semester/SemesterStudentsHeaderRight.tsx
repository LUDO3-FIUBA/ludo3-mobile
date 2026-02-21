import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Button, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { modifyStudentsOfASemester, selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { useNavigation } from '@react-navigation/native';
import { teacherSemestersRepository, teacherStudentsRepository } from '../../repositories';
import { TeacherStudent } from '../../models/TeacherStudent';
import { AddedStudentToSemester } from '../../models/AddedStudentToSemester';
import SquaredButton from '../../components/SquaredButton';
import { lightModeColors } from '../../styles/colorPalette';
import { MaterialIcon } from '../../components';

interface Props {}

export function SemesterStudentsHeaderRight({ }: Props) {
  const semesterData = useAppSelector(selectSemesterData)!;
  const [modalVisible, setModalVisible] = useState(false);
  const [studentPadron, setStudentPadron] = useState<string>('');
  const [student, setStudent] = useState<TeacherStudent | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dispatch = useAppDispatch()
  const navigation = useNavigation();

  const openAddStudentPrompt = () => {
    setModalVisible(true);
  };

  const handleAddStudent = async () => {
    setModalVisible(false);
    setStudentPadron('')

    if (studentPadron) {
      try {
        // Check that student is not already part of the semester
        const foundStudentByPadron = semesterData.students.find(actual => actual.padron === studentPadron)
        if (foundStudentByPadron) {
          Alert.alert('Ocurrió un error', `${foundStudentByPadron.firstName} ${foundStudentByPadron.lastName} con padrón ${foundStudentByPadron.padron} ya es parte del cuatrimestre actual.`)
        } else {
          const studentData: TeacherStudent = await teacherStudentsRepository.getStudentByPadron(studentPadron);
          setStudent(studentData);
          setConfirmVisible(true);
        }
      } catch (error) {
        Alert.alert('Padrón no existente', `No pudimos encontrar al alumno de padrón ${studentPadron}`);
      }
    }
  };

  const confirmAddStudent = async () => {
    setConfirmVisible(false);
    if (student) {
      try {
        const addedStudentToSemester: AddedStudentToSemester = await teacherSemestersRepository.addStudentToSemester(student.id, semesterData.id)
        console.log("Added students to semester", addedStudentToSemester);
        dispatch(modifyStudentsOfASemester(addedStudentToSemester.semester.students))
        Alert.alert('Éxito', 'Estudiante agregado exitosamente');
      } catch (error) {
        Alert.alert('Error', 'An error occurred while adding the student');
      }
    }
  };

  const onPressCancel = () => {
    setModalVisible(false);
    setStudentPadron('')
  }


  return (
    <View style={styles.navButtonsContainer}>
      <TouchableOpacity style={styles.navButton} onPress={openAddStudentPrompt}>
        <MaterialIcon name="plus" fontSize={24} color='gray' />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Ingresar padrón del estudiante"
              value={studentPadron}
              onChangeText={setStudentPadron}
            />
            <View style={styles.buttonContainer}>
              <SquaredButton text="Cancelar" onPress={onPressCancel} color={lightModeColors.institutional}/>
              <SquaredButton text="Confirmar" onPress={handleAddStudent} color={lightModeColors.institutional} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalView}>
            {student && (
              <>
                <Text style={styles.studentName}>¿Está seguro de agregar este estudiante al cuatrimestre? </Text>
                <Text style={{...styles.studentText, marginTop: 10 }}>Nombre completo: {student.firstName} {student.lastName} </Text>
                <Text style={{...styles.studentText}}>DNI: {student.dni}</Text>
                <Text style={styles.studentText}>Email: {student.email}</Text>
                <Text style={styles.studentText}>Padron: {student.padron}</Text>
                <View style={{...styles.buttonContainer, marginTop: 10}}>
                  <SquaredButton text="Cancelar" onPress={() => setConfirmVisible(false)} />
                  <SquaredButton text="Agregar" onPress={confirmAddStudent} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navButtonsContainer: {
    flexDirection: 'row',
    marginRight: 15,
  },
  navButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  confirmModalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  input: {
    height: 55,
    fontSize: 16,
    borderRadius: 8,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  studentName: {
    fontSize: 30,
    textAlign: 'left'
  },
  studentText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
