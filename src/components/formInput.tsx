import React, { useState, useEffect, forwardRef } from 'react';
import { View, TextInput, Text } from 'react-native';
import validate from 'validate.js';

type KeyboardType = 'default' | 'numeric' | 'email-address'; // Add more types if needed
type ReturnKeyType = 'default' | 'next' | 'send'; // Add more types if needed

interface FormInputProps {
  initialValue?: string;
  placeholder?: string;
  secure?: boolean;
  style?: object;
  placeholderColor?: string;
  errorStyle?: object;
  keyboardType?: KeyboardType;
  returnKeyType?: ReturnKeyType;
  nextField?: () => any;
  onTextChanged?: (newValue: string, isValid: boolean) => void;
  blurOnSubmit?: boolean;
  errorMessageOnEditFinish?: boolean;
  validation?: object;
  editable?: boolean;
}

const FormInput = forwardRef<TextInput, FormInputProps>(({
  initialValue = '',
  placeholder = '',
  secure = false,
  style = {},
  placeholderColor = 'white',
  errorStyle = {},
  keyboardType = 'default',
  returnKeyType = 'default',
  nextField,
  onTextChanged,
  blurOnSubmit = true,
  errorMessageOnEditFinish = true,
  validation,
  editable = true,
}, ref) => {
  const [value, setValue] = useState(initialValue);
  const validateValue = (val: string): string | null => {
    const formValues = { campo: val };
    const formFields = { campo: validation };
    const result = validate(formValues, formFields);
    return result && result.campo ? result.campo[0] : null;
  };

  const [error, setError] = useState<string | null>(
    initialValue ? validateValue(initialValue) : null
  );

  useEffect(() => {
    setValue(initialValue);
    setError(initialValue ? validateValue(initialValue) : null);
  }, [initialValue]);

  const handleValueChanged = (newValue: string) => {
    setValue(newValue);
    if (!errorMessageOnEditFinish) {
      setError(validateValue(newValue));
    }
    if (onTextChanged) {
      onTextChanged(newValue, !validateValue(newValue));
    }
  };

  const handleBlur = () => {
    if (errorMessageOnEditFinish) {
      setError(validateValue(value));
    }
  };

  return (
    <View>
      <TextInput
        ref={ref}
        style={style}
        value={value}
        autoCapitalize="none"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onChangeText={handleValueChanged}
        onSubmitEditing={() => {
          if (nextField) {
            nextField().focus();
          }
        }}
        onBlur={handleBlur}
        blurOnSubmit={blurOnSubmit}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        editable={editable}
      />
      {error ? <Text style={errorStyle}>{error}</Text> : null}
    </View>
  );
});

export default FormInput;
