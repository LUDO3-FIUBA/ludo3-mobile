import React from "react";
import { Camera, Code, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import QRScannerCamera from "./QRScannerCamera";
import PhotoCamera from "./PhotoCamera";
import { Text, View } from "react-native";
import { RoundedButton } from "../../../components";
import { takePicture as style } from "../../../styles"

interface CameraWithPermissionsProps {
    takePicture: (camera: Camera) => Promise<void>;
    cameraType: 'back' | 'front';
    onBarCodeRead: (codes: Code[]) => void;
    searchForQRCode: boolean;
    ignoreReadings: boolean
}

const CameraWithPermissions = ({ takePicture, cameraType, onBarCodeRead, searchForQRCode, ignoreReadings }: CameraWithPermissionsProps) => {
    const requestedDevice = useCameraDevice(cameraType);
    const fallbackDevice = useCameraDevice(cameraType === 'front' ? 'back' : 'front');
    const { hasPermission, requestPermission } = useCameraPermission();

    // Use requested device if available, otherwise fallback to the other camera
    const device = requestedDevice || fallbackDevice;

    console.log(`[Camera] hasPermission: ${hasPermission}, requestedDevice: ${requestedDevice?.id || 'null'}, fallbackDevice: ${fallbackDevice?.id || 'null'}, cameraType: ${cameraType}`)

    if (hasPermission === null) {
        return (
            <View style={{ position: 'absolute', bottom: 8, width: '100%', alignItems: 'center', gap: 24, padding: 16 }}>
                <Text style={{ fontSize: 16 }}>Verificando permisos de cámara...</Text>
            </View>
        )
    }

    if (!hasPermission) {
        return (
            <View style={{ position: 'absolute', bottom: 8, width: '100%', alignItems: 'center', gap: 24,padding: 16 }}>
                <Text style={{ fontSize: 16 }}>Se requieren los permisos de Cámara para continuar utilizando la aplicación</Text>
                <RoundedButton text="Habilitar cámara" onPress={requestPermission} />
            </View>
        )
    }

    if (!device) {
        return (
            <View style={{ position: 'absolute', bottom: 8, width: '100%', alignItems: 'center', gap: 24, padding: 16 }}>
                <Text style={{ fontSize: 16 }}>No se encontró ninguna cámara en tu dispositivo. Verifica la configuración del emulador o dispositivo.</Text>
            </View>
        )
    }

    if (!searchForQRCode) {
        return <PhotoCamera device={device} takePicture={takePicture} />
    } else {
        return <QRScannerCamera device={device} onBarCodeRead={onBarCodeRead} ignoreReadings={ignoreReadings} />
    }
}

export default CameraWithPermissions;
