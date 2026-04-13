import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcon } from '../../components';

interface Props {
	subjectId: number;
	subjectName: string;
}

export function FinalsListHeaderRight({ subjectId, subjectName }: Props) {
	const navigation = useNavigation()

	const addFinal = () => {
		navigation.navigate('AddFinal', {
			subjectId: subjectId,
			subjectName: subjectName,
		});
	}

	return (
		<View style={styles.navButtonsContainer}>
			<TouchableOpacity style={styles.navButton} onPress={addFinal}>
				<MaterialIcon name="plus" fontSize={24} color='gray' />
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
