import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcon } from '../../components';

interface Props { }

export function EvaluationsListHeaderRight({ }: Props) {
	const navigation = useNavigation()

	const addEvaluation = () => {
		navigation.navigate('AddEvaluation', {});
	}

	return (
		<View style={styles.navButtonsContainer}>
			<TouchableOpacity style={styles.navButton} onPress={addEvaluation}>
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
