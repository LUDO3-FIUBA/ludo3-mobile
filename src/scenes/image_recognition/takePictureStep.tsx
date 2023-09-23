import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Text, Alert, AppStateStatus, AppState } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';
import { Camera, CameraDevice, CameraRuntimeError, useCameraDevices } from 'react-native-vision-camera';

Icon.loadFont();

interface TakePictureStepProps {
  id?: string;
  configuration?: TakePictureStepConfiguration;
}

const TakePictureStep: React.FC<TakePictureStepProps> = ({ id, configuration: propConfiguration }) => {
  const [loading, setLoading] = useState(false);
  const [ignoreReadings, setIgnoreReadings] = useState(false);
  const [configuration, setConfiguration] = useState<TakePictureStepConfiguration | null>(null);

  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { configuration: any } }, 'params'>>();

  const devices = useCameraDevices();
  const cameraPermissionGranted = useCameraPermission();

  const getConfiguration = useCallback(() => {
    if (configuration) {
      return configuration;
    }

    if (route.params?.configuration) {
      const config = TakePictureStepConfigurationFactory.fromObject(route.params.configuration);
      setConfiguration(config);
      return config;
    }

    if (propConfiguration) {
      setConfiguration(propConfiguration);
      return propConfiguration;
    }

    return null;
  }, [configuration, route.params?.configuration, propConfiguration]);


  useEffect(() => {
    const config = getConfiguration();

    if (config?.searchForQRCode) {
      const focusUnsubscribe = navigation.addListener('focus', () => setIgnoreReadings(false));
      const blurUnsubscribe = navigation.addListener('blur', () => setIgnoreReadings(true));

      return () => {
        focusUnsubscribe();
        blurUnsubscribe();
      };
    }

    return undefined;
  }, [navigation, getConfiguration]);

  useEffect(() => {
    if (id) {
      // fetchData();
      // observeScreenChangesIfNecessary();
    }
  }, [id]);


  const onBarCodeRead = async (scanResult: any) => {
    if (scanResult.data != null) {
      setLoading(true);
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(scanResult.data, navigation, disableLoading);
    }
  };

  const takePicture = async (camera: any) => {
    const options = {
      width: 180,
      quality: 0.3,
      base64: true,
      forceUpOrientation: true,
      fixOrientation: true,
      doNotSave: true,
      orientation: 'portrait',
    };

    setLoading(true);

    try {
      const data = await camera.takePictureAsync(options);
      const base64 = data.base64;
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(base64, navigation, disableLoading);
    } catch (error) {
      setLoading(false);
      Alert.alert('Hubo un error sacando la foto');
    }
  };

  const config = getConfiguration();
  if (!config) return null;

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <Text style={style().text}>{config.description}</Text>
        <CameraViewOrPermissionMessage cameraPermissionGranted={cameraPermissionGranted} device={devices.front} />
      </SafeAreaView>
    </View>
  );
};

TakePictureStep.defaultProps = {
  configuration: new TakePictureStepConfiguration(),
};

const useCameraPermission = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  useEffect(() => {
    Camera.requestCameraPermission().then((res) => setPermissionGranted(res === 'granted'));
  }, [])
  return permissionGranted;
}

export default TakePictureStep;


const useIsAppForeground = (): boolean => {
  const [isForeground, setIsForeground] = useState(true);

  useEffect(() => {
    const onChange = (state: AppStateStatus): void => {
      setIsForeground(state === 'active');
    };
    const listener = AppState.addEventListener('change', onChange);
    return () => listener.remove();
  }, [setIsForeground]);

  return isForeground;
};


interface CameraViewOrPermissionMessageProps {
  cameraPermissionGranted: boolean;
  device: CameraDevice;
}

const CameraViewOrPermissionMessage = ({ cameraPermissionGranted, device }: CameraViewOrPermissionMessageProps) => {
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error)
  }, [])

  const isAppForeground = useIsAppForeground()
  console.log(cameraPermissionGranted, isAppForeground)

  if (!cameraPermissionGranted) {
    return (
      <Text>Se requieren los permisos de Cámara para continuar utilizando la aplicación</Text>
    )
  }

  if (device) {
    return (
      <Camera
        onError={onError}
        style={{ flex: 1 }}
        device={device}
        isActive={isAppForeground}
      />
    );
  }

  return <></>
}
