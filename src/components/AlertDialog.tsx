import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { lightModeColors } from '../styles/colorPalette';

type AlertDialogMode = 'confirm' | 'type-to-confirm';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  mode?: AlertDialogMode;
  confirmationText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  mode = 'confirm',
  confirmationText,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!visible) setTyped('');
  }, [visible]);

  const requiresTyping = mode === 'type-to-confirm' && !!confirmationText;
  const matches = !requiresTyping || typed.trim() === confirmationText!.trim();
  const canConfirm = !loading && matches;

  const confirmColor = destructive ? lightModeColors.failed : lightModeColors.mainColor;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {requiresTyping && (
            <>
              <Text style={styles.typeHint}>
                Escribí <Text style={styles.typeHintBold}>{confirmationText}</Text> para confirmar:
              </Text>
              <TextInput
                style={styles.input}
                value={typed}
                onChangeText={setTyped}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                placeholder={confirmationText}
                placeholderTextColor="#bbb"
              />
            </>
          )}

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: confirmColor },
                !canConfirm && styles.confirmDisabled,
              ]}
              onPress={onConfirm}
              disabled={!canConfirm}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 22,
    gap: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#222' },
  message: { fontSize: 14, color: '#444', lineHeight: 20 },
  typeHint: { fontSize: 13, color: '#555' },
  typeHintBold: { fontWeight: '700', color: '#222' },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
  },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#eeeeee' },
  cancelText: { color: '#333', fontWeight: '600' },
  confirmText: { color: 'white', fontWeight: '700' },
  confirmDisabled: { opacity: 0.5 },
});

export default AlertDialog;
