import React from "react";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

const EditableText = ({ value, onChange, editable }: { value: string, onChange: (text: string) => void, editable: boolean }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(value);

	const handleBlur = () => {
		setIsEditing(false);
		const grade = Number(text);
		if (text === '') {
			return;
		}

		if (isNaN(grade) || grade < 1 || grade > 10) {
			Alert.alert('Error', 'La nota debe ser un número entre 1 y 10.');
			setText(value); // reset to original value
			return;
		}

		onChange(text);
	};

	return (
		<View style={styles.editableTextContainer}>
			{isEditing ? (
				<TextInput
					inputMode='numeric'
					style={styles.input}
					value={text}
					onChangeText={setText}
					onBlur={handleBlur}
					autoFocus
					editable={editable}
				/>
			) : (
				<Text style={styles.text} onPress={() => editable && setIsEditing(true)}>
					{value}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	editableTextContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		fontSize: 16,
		color: '#333',
		textAlign: 'center',
		minWidth: 80,
	},
	input: {
		fontSize: 16,
		color: '#333',
		textAlign: 'center',
	},
});

export default EditableText;
