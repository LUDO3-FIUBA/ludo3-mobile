import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { TeacherModel } from '../../models/TeacherModel';
import ModalSelector from 'react-native-modal-selector';
import ModalSelectorItem from './ModalSelectorItem';
import teacherRoles, { TeacherRole } from '../../models/TeacherRoles';
import { useAppDispatch } from '../../redux/hooks';
import { addTeacherRoleToCommission } from '../../redux/reducers/teacherStaffSlice';
import SquaredButton from '../../components/SquaredButton';

interface RecommendationItemProps {
  teacher: TeacherModel
  setShowConfirmationModal: (value: boolean) => void
  setSelectedTeacher: (value: TeacherModel | null) => void
}

const RecommendationItem = ({ teacher, setShowConfirmationModal, setSelectedTeacher }: RecommendationItemProps) => {
  const openModal = () => {
    setSelectedTeacher(teacher)
    setShowConfirmationModal(true)
  }

  return (
    <TouchableOpacity onPress={openModal}>
      <View style={styles.item}>
        <Text>{teacher.firstName} {teacher.lastName} (DNI: {teacher.dni})</Text>
      </View>
    </TouchableOpacity>
  );
}

interface Props {
  allTeachers: TeacherModel[]
  commissionId: number
}

const TeachersSearchBar: React.FC<Props> = ({ allTeachers, commissionId }) => {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recommendations, setRecommendations] = useState<TeacherModel[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherModel | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeacherRole | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);

    if (searchTerm) {
      const isNumeric = /^\d+$/.test(searchTerm);
      let filteredData = isNumeric
        ? allTeachers.filter(teacher => teacher.dni.includes(searchTerm))
        : allTeachers.filter(teacher =>
          teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setRecommendations(filteredData);
    } else {
      setRecommendations([]);
    }
  };

  const generateTeacherRoles = () => {
    return teacherRoles.map((currentRole, index) => (
      {
        key: index + 1,
        currentRole: currentRole,
        component: <ModalSelectorItem label={currentRole.longVersion} />
      }
    ));
  }

  const handleRoleChange = (option: any) => {
    setSelectedRole(option.currentRole);
    setShowConfirmationModal(true);
  };

  const cancelTeacherAddition = () => {
    setSelectedTeacher(null);
    setSelectedRole(null);
    setShowConfirmationModal(false);
  }

  const confirmAddition = () => {
    if (selectedTeacher && selectedRole) {
      dispatch(addTeacherRoleToCommission({ commissionId: commissionId, teacherId: selectedTeacher.id, role: selectedRole.shortVersion}))
      setSelectedTeacher(null);
      setSelectedRole(null);
      setShowConfirmationModal(false);
    } else {
      throw ('There was an error adding the teacher to the commission. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o DNI"
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.dni}
        renderItem={({ item }) => <RecommendationItem teacher={item} setSelectedTeacher={setSelectedTeacher} setShowConfirmationModal={setShowConfirmationModal} />}
      />

      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Por favor, seleccione un rol para el profesor {selectedTeacher?.firstName} {selectedTeacher?.lastName} para poder agregarlo a la comisión
            </Text>
            <ModalSelector
              style={styles.modalSelector}
              data={[{ key: 0, section: true, label: 'Elegí el rol del docente a agregar' }, ...generateTeacherRoles()]}
              onChange={handleRoleChange}
              cancelText='Cancelar'
            >
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 20, color: 'darkgray', textAlign: 'center' }}
                editable={false}
                placeholder='Elegí el rol del docente a agregar'
                value={selectedRole?.longVersion} />
            </ModalSelector>
            <View style={styles.modalSelectorButtons}>
              <SquaredButton text="Cancelar" onPress={cancelTeacherAddition} />
              <View style={styles.modalSelectorConfirmButton}>
                <SquaredButton text="Confirmar" onPress={confirmAddition} disabled={!selectedRole} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 12,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
  },
  modalSelector: {
    width: '100%',
    marginBottom: 15,
  },
  modalSelectorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  modalSelectorConfirmButton: {
    marginLeft: 10,
  }
});

export default TeachersSearchBar;
