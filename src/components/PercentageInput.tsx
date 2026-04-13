import { clamp } from 'lodash';
import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props {
    initialValue: string;
    onBlur: (value: number) => void;
    enabled: boolean
}

const PercentageInput: React.FC<Props> = ({ initialValue, onBlur, enabled = true }) => {
    const [tempValue, setTempValue] = useState(initialValue);

    useEffect(() => {
        setTempValue(initialValue);
    }, [initialValue]);

    const handleBlur = (text: string) => {
        const floatValue = parseFloat(text);
        let newValue = initialValue
        if (floatValue) {
            const clampedValue = clamp(floatValue, 0.01, 99.0);
            newValue = String(clampedValue);
            onBlur(clampedValue);
        }
        setTempValue(newValue);
    };

    return (
        <TextInput
            editable={enabled}
            style={styles.input}
            keyboardType='numeric'
            value={tempValue}
            onChangeText={setTempValue}
            onBlur={() => handleBlur(tempValue)}
            placeholder="Ingrese el porcentaje deseado a auto-asignar"
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        height: 55,
    },
});

export default PercentageInput;
