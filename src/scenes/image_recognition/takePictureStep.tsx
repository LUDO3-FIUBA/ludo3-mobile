import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, SafeAreaView, Text, Alert, AppStateStatus, AppState, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';
import { Camera, CameraDevice, CameraRuntimeError, Code, PhotoFile, useCameraDevice, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import { manipulateAsync, FlipType, SaveFormat, Action } from 'expo-image-manipulator';
import { Loading, RoundedButton } from '../../components';

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


  const onBarCodeRead = async (codes: Code[]) => {
    console.log(`QR CODE SCANNER: ${JSON.stringify(codes)}`)
    if (codes.length !== 0) {
      setIgnoreReadings(true);
      setLoading(true);
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(codes[0].value, navigation, disableLoading);
    }
  };

  const takePicture = async (camera: Camera) => {
    setLoading(true);

    try {
      const photo = await camera.takePhoto();
      console.log(photo.orientation, photo.height, photo.width);
      const photoActions: Action[] = [];
      addRotationIfWrongOrientation(photo, photoActions);
      const photoWithOrientation = await manipulateAsync(photo.path, photoActions, { compress: 0.5, base64: true });
      const base64string = `data:image/jpeg;base64,${photoWithOrientation.base64}`
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(base64string, navigation, disableLoading);
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
        {loading && <Loading />}
        <CameraViewOrPermissionMessage
          takePicture={takePicture}
          onBarCodeRead={onBarCodeRead}
          cameraType={config.cameraType}
          searchForQRCode={config.searchForQRCode}
          ignoreReadings={ignoreReadings} />
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
  const isFocused = useIsFocused();

  useEffect(() => {
    const onChange = (state: AppStateStatus): void => {
      setIsForeground(state === 'active');
    };
    const listener = AppState.addEventListener('change', onChange);
    return () => listener.remove();
  }, [setIsForeground]);

  return isForeground && isFocused;
};

interface CameraViewOrPermissionMessageProps {
  takePicture: (camera: Camera) => Promise<void>;
  cameraType: 'back' | 'front';
  onBarCodeRead: (codes: Code[]) => void;
  searchForQRCode: boolean;
  ignoreReadings: boolean
}

const CameraViewOrPermissionMessage = ({ takePicture, cameraType, onBarCodeRead, searchForQRCode, ignoreReadings }: CameraViewOrPermissionMessageProps) => {
  const device = useCameraDevice(cameraType);
  const cameraPermissionGranted = useCameraPermission();

  console.log(`cameraPermissionGranted: ${cameraPermissionGranted}`)

  if (!cameraPermissionGranted) {
    return (
      <Text>Se requieren los permisos de Cámara para continuar utilizando la aplicación</Text>
    )
  }

  if (device && !searchForQRCode) {
    return <PhotoCamera device={device} takePicture={takePicture} />
  } else if (device && searchForQRCode) {
    return <QRScannerCamera device={device} onBarCodeRead={onBarCodeRead} ignoreReadings={ignoreReadings} />
  }

  return <></>
}

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
      photo={true} />
    <RoundedButton
      text='Tomar foto'
      onPress={async () => {
        if (camera.current === null) {
          return;
        }
        takePicture(camera.current);
      }}
      style={{MainContainer: style().captureContainer, fontSize: 18, tintColor: 'white'}} // TODO: move this to the src/styles collection
    />
  </>;
}

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

/**
 * Adds a `rotate` action of +90 degrees for manipulateAsync in case it is needed.
 * It is added in the case that the photo is `portrait` but its' width is bigger than its' height
 * This means that the saved photo orientation is incorrect and must be rotated
 * @param photo photo taken via react-native-vision-camera
 * @param photoActions 
 */
function addRotationIfWrongOrientation(photo: PhotoFile, photoActions: Action[]) {
  if (photo.orientation === 'portrait' && photo.width > photo.height) {
    photoActions.push({ rotate: 90 })
  }
}
