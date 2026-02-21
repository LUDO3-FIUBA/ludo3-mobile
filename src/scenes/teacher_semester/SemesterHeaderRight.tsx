import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcon } from '../../components';

interface Props {}

export function SemesterHeaderRight({ }: Props) {
  const navigation = useNavigation();

	const redirectToSemesterEditScreen = () => {
		navigation.navigate('SemesterEditScreen')
	}

  return (
    <View style={styles.navButtonsContainer}>
      <TouchableOpacity style={styles.navButton} onPress={redirectToSemesterEditScreen}>
        <MaterialIcon name="pencil" fontSize={24} color='gray' />
      </TouchableOpacity>
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
});
