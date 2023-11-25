import React from "react";
import { useCallback, useRef } from "react";
import { Camera, CameraDevice, CameraRuntimeError } from "react-native-vision-camera";
import { RoundedButton } from "../../../components";
import { useIsAppForeground } from "./hooks";
import { takePicture as style } from '../../../styles';
import { View } from "react-native";

interface PhotoCameraProps {
    device: CameraDevice;
    takePicture: (camera: Camera) => Promise<void>
}

const PhotoCamera = ({ device, takePicture }: PhotoCameraProps) => {
    const camera = useRef<Camera>(null)

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])


    const isAppForeground = useIsAppForeground();
    console.log(`PhotoCamera - isAppForeground: ${isAppForeground}`);

    if (!isAppForeground) return <></>

    return <>
        <Camera
            ref={camera}
            onError={onError}
            style={{ flex: 1 }}
            device={device}
            isActive={isAppForeground}
            orientation='portrait'
            resizeMode="cover"
            photo={true} />
        <View style={{ position: 'absolute', bottom: 8, width: '100%', alignItems: 'center', padding: 16 }}>
            <RoundedButton
                text='Tomar foto'
                onPress={async () => {
                    if (camera.current === null) {
                        return;
                    }
                    takePicture(camera.current);
                }}
            />
        </View>
    </>;
}

export default PhotoCamera;