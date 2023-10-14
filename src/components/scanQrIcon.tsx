import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scanQrIcon as style } from '../styles';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

Icon.loadFont()

interface ScanQRCodeIconProps {
    navigation: NavigationProp<ParamListBase>
}

const ScanQRCodeIcon = ({ navigation }: ScanQRCodeIconProps) => {
    return (
        <View style={style().container}>
            <TouchableOpacity style={style().touchableOpacity}>
                <Icon name='qrcode-scan' style={style().icon} 
                onPress={() => navigation.navigate("DeliverFinalExam")}/>
            </TouchableOpacity>
        </View>
    );
};

export default ScanQRCodeIcon;