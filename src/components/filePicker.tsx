import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SubmissionFileValue, validateSubmissionFile } from './filePicker.shared';

type FilePickerProps = {
  value: SubmissionFileValue | null;
  onChange: (file: SubmissionFileValue | null) => void;
  pickButtonLabel?: string;
  removeButtonLabel?: string;
  disabled?: boolean;
};

const FilePicker: React.FC<FilePickerProps> = ({
  value,
  onChange,
  pickButtonLabel = 'Seleccionar archivo',
  removeButtonLabel = 'Quitar archivo',
  disabled = false,
}) => {
  const pickFile = async () => {
    if (disabled) {
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
        size: asset.size,
      };

      const errorMessage = validateSubmissionFile(file);

      if (errorMessage) {
        Alert.alert('Archivo no válido', errorMessage);
        return;
      }

      onChange(file);
    } catch (error: any) {
      console.error('Error picking file', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  return value ? (
    <View style={styles.selectedFileRow}>
      <Text style={styles.fileName}>{value.name}</Text>
      <TouchableOpacity disabled={disabled} onPress={() => onChange(null)}>
        <Text style={styles.removeButton}>{removeButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity style={styles.pickButton} disabled={disabled} onPress={pickFile}>
      <Text style={styles.pickButtonText}>{pickButtonLabel}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pickButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#1f2937',
  },
  selectedFileRow: {
    gap: 8,
  },
  fileName: {
    color: '#111',
  },
  removeButton: {
    color: '#ef4444',
  },
});

export default FilePicker;