import { View, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { TeacherModel } from '../../models/TeacherModel';
import { TeacherTuple } from '../../models/TeacherTuple';
import { MaterialIcon } from '../../components';

interface Props {
  staffTeachers: TeacherTuple[];
  allTeachers: TeacherModel[];
  commissionId: number;
}

export default function TeachersHeaderRight({ staffTeachers, allTeachers, commissionId }: Props) {
  const navigation = useNavigation();

  const saveOpacityStyle = {
    ...styles.navButton,
    opacity: 1,
  };

  const navigateToTeachersConfiguration = () => {
    navigation.navigate('TeachersConfiguration', {
      staffTeachers: staffTeachers,
      commissionId: commissionId,
    });
  }

  const addNewTeacherToCommission = () => {
    navigation.navigate('AddTeachersConfigurationList', {
      staffTeachers: staffTeachers,
      allTeachers: allTeachers,
      commissionId: commissionId,
    })
  }


  return (
    <View style={styles.iconsContainer}>
      <TouchableOpacity
        style={saveOpacityStyle}
        onPress={() => addNewTeacherToCommission()}>
        <MaterialIcon name="plus" fontSize={24} style={styles.navButtonIcon} color='gray' />
      </TouchableOpacity>
      <TouchableOpacity
        style={saveOpacityStyle}
        onPress={() => navigateToTeachersConfiguration()}>
        <MaterialIcon name="pencil" fontSize={24} style={styles.navButtonIcon} color='gray' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  navButtonIcon: {
    marginRight: 15,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8
  },
  navButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
