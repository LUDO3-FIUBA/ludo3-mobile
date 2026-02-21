import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Text } from 'react-native';
import { MaterialIcon } from '../../components';
import SquaredButton from '../../components/SquaredButton';
import { lightModeColors } from '../../styles/colorPalette';
import { teacherFinalsRepository, teacherStudentsRepository } from '../../repositories';
import { TeacherFinal } from '../../models/TeacherFinal';
import { TeacherStudent } from '../../models/TeacherStudent';

interface Props {
  final: TeacherFinal
  fetchData: () => void
}

export function FinalExamSubmissionsHeaderRight({ final, fetchData }: Props) {
  const navigation = useNavigation()
  const [studentToAdd, setStudentToAdd] = useState<TeacherStudent | null>(null)

  const [studentPadron, setStudentPadron] = useState<string>('');

  const [modalPadronInputVisible, setModalPadronInputVisible] = useState(false)
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false)

  const fetchStudent = async () => {
    try {
      const student = await teacherStudentsRepository.getStudentByPadron(studentPadron);

      setStudentToAdd(student);
      setStudentPadron('')
      setModalPadronInputVisible(false)
      setConfirmationModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch student", error);
      Alert.alert('Error',
        'No pudimos buscar la información del alumno. ' +
        'Asegurate de que el padrón esté escrito correctamente')
    }
  }

  const cancelStudentAddition = () => {
    setStudentPadron('');
    setModalPadronInputVisible(false);
  }

  const confirmStudentAddition = async () => {
    const padron: number = +studentToAdd!.padron;
    const response = await teacherFinalsRepository.addStudent(final.id, padron)
    setStudentToAdd(null);
    setConfirmationModalVisible(false);
    fetchData()
    return response;
  }

  const addFinalExamSubmission = () => {
    setModalPadronInputVisible(true);
  }

  const showConfirmNotifyStudents = () => {
    Alert.alert(
      'Notificar estudiantes',
      `¿Está seguro de que desea notificar a los estudiantes de sus notas? Se enviará una notificación a todos los estudiantes que hayan recibido una nota`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => teacherFinalsRepository.notifyGrades(final.id)
        },
      ]
    );
  };

  return (
    <View style={styles.navButtonsContainer}>
      <TouchableOpacity style={{...styles.navButton, marginRight: 15 }} onPress={showConfirmNotifyStudents}>
        <MaterialIcon name="bell-ring" fontSize={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={addFinalExamSubmission}>
        <MaterialIcon name="plus" fontSize={24} color='gray' />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalPadronInputVisible}
        onRequestClose={() => setModalPadronInputVisible(false)}
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
              <SquaredButton text="Cancelar" onPress={cancelStudentAddition} color={lightModeColors.institutional} />
              <SquaredButton text="Confirmar" onPress={fetchStudent} color={lightModeColors.institutional} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmationModalVisible}
        onRequestClose={() => setConfirmationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalView}>
            {studentToAdd && (
              <>
                <Text style={styles.studentName}>¿Está seguro de agregar este estudiante al final? </Text>
                <Text style={{ ...styles.studentText, marginTop: 10 }}>Nombre completo: {studentToAdd.firstName} {studentToAdd.lastName} </Text>
                <Text style={{ ...styles.studentText }}>DNI: {studentToAdd.dni}</Text>
                <Text style={styles.studentText}>Email: {studentToAdd.email}</Text>
                <Text style={styles.studentText}>Padron: {studentToAdd.padron}</Text>
                <View style={{ ...styles.buttonContainer, marginTop: 10 }}>
                  <SquaredButton text="Cancelar" onPress={() => setConfirmationModalVisible(false)} />
                  <SquaredButton text="Agregar" onPress={confirmStudentAddition} />
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
  confirmModalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
    borderColor: '#ccc',
    borderWidth: 1,
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
