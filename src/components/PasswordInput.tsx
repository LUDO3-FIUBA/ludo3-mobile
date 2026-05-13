import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {lightModeColors} from '../styles/colorPalette';

const EyeIcon = ({color = '#888'}: {color?: string}) => (
  <Icon name="eye" size={22} color={color} />
);

const EyeOffIcon = ({color = '#888'}: {color?: string}) => (
  <Icon name="eye-off" size={22} color={color} />
);

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
  style?: ViewStyle;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Contraseña',
  editable = true,
  error,
  style,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={style}>
      <View style={[styles.row, error !== undefined && styles.rowError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={!visible}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setVisible(v => !v)}
          disabled={!editable}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </TouchableOpacity>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  rowError: {
    borderColor: lightModeColors.failed,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#222',
  },
  eyeButton: {
    padding: 14,
  },
  errorText: {
    color: lightModeColors.failed,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default PasswordInput;
