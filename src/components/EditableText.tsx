import React from "react";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AlertDialog from "./AlertDialog";

const EditableText = ({ value, onChange, editable }: { value: string, onChange: (text: string) => void, editable: boolean }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(value);
	const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

	const handleBlur = () => {
		setIsEditing(false);
		const grade = Number(text);
		if (text === '') {
			return;
		}

		if (isNaN(grade) || grade < 1 || grade > 10) {
			setAlertDialog({ title: 'Error', message: 'La nota debe ser un número entre 1 y 10.' });
			setText(value);
			return;
		}

		onChange(text);
	};

	return (
		<View style={styles.editableTextContainer}>
			<AlertDialog
				visible={alertDialog !== null}
				title={alertDialog?.title ?? ''}
				message={alertDialog?.message ?? ''}
				mode="info"
				confirmLabel="Aceptar"
				onConfirm={() => setAlertDialog(null)}
			/>
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
