import React from "react";
import { useCallback, useRef } from "react";
import { Camera, CameraDevice, CameraRuntimeError, Code, useCodeScanner } from "react-native-vision-camera";
import { useIsAppForeground } from "./hooks";

interface QRScannerCameraProps {
    device: CameraDevice;
    onBarCodeRead: (codes: Code[]) => void;
    ignoreReadings: boolean
}

const QRScannerCamera = ({ device, onBarCodeRead, ignoreReadings }: QRScannerCameraProps) => {
    const camera = useRef<Camera>(null)

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (!ignoreReadings)
                onBarCodeRead(codes)
        }
    }
    )

    const isAppForeground = useIsAppForeground();
    console.log(`QRScannerCamera - isAppForeground: ${isAppForeground}`);

    if (!isAppForeground) return <></>

    return <Camera
        ref={camera}
        onError={onError}
        style={{ flex: 1 }}
        device={device}
        isActive={isAppForeground}
        codeScanner={codeScanner}
        orientation='portrait'
    />
}

export default QRScannerCamera;
