import React from "react";
import { Camera, Code, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import QRScannerCamera from "./QRScannerCamera";
import PhotoCamera from "./PhotoCamera";
import { Text } from "react-native";
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
    const device = useCameraDevice(cameraType);
    const { hasPermission, requestPermission } = useCameraPermission();

    console.log(`cameraPermissionGranted: ${hasPermission}`)

    if (!hasPermission) {
        return (<>
            <Text style={{ flex: 1, flexGrow: 1 }}>Se requieren los permisos de Cámara para continuar utilizando la aplicación</Text>
            <RoundedButton text="Habilitar cámara" onPress={requestPermission}
                style={{ MainContainer: style().captureContainer, fontSize: 18, tintColor: 'white' }} // TODO: move this to the src/styles collection
            />
        </>
        )
    }

    if (device && !searchForQRCode) {
        return <PhotoCamera device={device} takePicture={takePicture} />
    } else if (device && searchForQRCode) {
        return <QRScannerCamera device={device} onBarCodeRead={onBarCodeRead} ignoreReadings={ignoreReadings} />
    }

    return <></>
}

export default CameraWithPermissions;
