import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    onChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const selectedFile = event.target.files && event.target.files[0];

    if (!selectedFile) {
      event.target.value = '';
      return;
    }

    const errorMessage = validateSubmissionFile(selectedFile);

    if (errorMessage) {
      window.alert(errorMessage);
      event.target.value = '';
      return;
    }

    onChange(selectedFile);
    event.target.value = '';
  };

  return (
    <View>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileChange}
        accept="application/pdf,image/jpeg,image/png,image/webp"
      />
      {value ? (
        <View style={styles.selectedFileRow}>
          <Text style={styles.fileName}>{value.name}</Text>
          <TouchableOpacity disabled={disabled} onPress={clearSelection}>
            <Text style={styles.removeButton}>{removeButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.pickButton} disabled={disabled} onPress={openPicker}>
          <Text style={styles.pickButtonText}>{pickButtonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
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