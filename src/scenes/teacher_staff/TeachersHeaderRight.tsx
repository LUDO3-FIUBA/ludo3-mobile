import { View, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { TeacherTuple } from '../../models/TeacherTuple';
import { MaterialIcon } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { fetchAllTeachers } from '../../redux/reducers/teacherStaffSlice';

interface Props {
  staffTeachers: TeacherTuple[];
  commissionId: number;
}

export default function TeachersHeaderRight({ staffTeachers, commissionId }: Props) {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

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

  const addNewTeacherToCommission = async () => {
    const action = await dispatch(fetchAllTeachers());

    if (fetchAllTeachers.fulfilled.match(action)) {
      navigation.navigate('AddTeachersConfigurationList', {
        staffTeachers: staffTeachers,
        allTeachers: action.payload,
        commissionId: commissionId,
      })
    }
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
