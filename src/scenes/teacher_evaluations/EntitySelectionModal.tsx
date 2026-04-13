import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TeacherStudent } from '../../models/TeacherStudent';
import { TeacherModel } from '../../models/TeacherModel';
import SquaredButton from '../../components/SquaredButton';
import { lightModeColors } from '../../styles/colorPalette';

// Define your props interface
interface StudentSelectionModalProps {
  visible: boolean;
  entities: (TeacherStudent | TeacherModel) [];
  onSelect: (entity: TeacherStudent | TeacherModel) => void;
  onClose: () => void;
  title: string
}

const EntitySelectionModal: React.FC<StudentSelectionModalProps> = ({
  visible,
  entities,
  onSelect,
  onClose,
  title
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={entities}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => onSelect(item)}>
                <Text style={styles.listItemText}>{item.firstName} {item.lastName}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={{ marginTop: 8 }}>
            <SquaredButton text="Cancelar" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Define your styles
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow effect
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  listItem: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listItemText: {
    fontSize: 16,
    color: '#555',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default EntitySelectionModal;
