import React from "react";
import { Clipboard, Text, ToastAndroid } from "react-native";

interface Props {
    email: string;
}

const CopyableEmailText = ({ email }: Props) => {
    const onPress = () => {
        Clipboard.setString(email);
        ToastAndroid.show('Email del docente copiado al portapapeles', ToastAndroid.SHORT);
    };

    return <Text
        style={{ color: 'gray', fontWeight: 'bold', fontStyle: 'italic', fontSize: 14, }}
        onPress={onPress}>
        {email}
    </Text>;
}

export default CopyableEmailText;