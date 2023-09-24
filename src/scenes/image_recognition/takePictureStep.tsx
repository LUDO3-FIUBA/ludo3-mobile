import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, SafeAreaView, Text, Alert, AppStateStatus, AppState, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';
import { Camera, CameraRuntimeError, PhotoFile, useCameraDevices } from 'react-native-vision-camera';
import { manipulateAsync, FlipType, SaveFormat, Action } from 'expo-image-manipulator';

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


  const onBarCodeRead = async (scanResult: any) => {
    if (scanResult.data != null) {
      setLoading(true);
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(scanResult.data, navigation, disableLoading);
    }
  };

  const takePicture = async (camera: Camera) => {
    // const options = {
    //   width: 180,
    //   quality: 0.3,
    //   base64: true,
    //   forceUpOrientation: true,
    //   fixOrientation: true,
    //   doNotSave: true,
    //   orientation: 'portrait',
    // };

    // setLoading(true);

    // try {
    //   const data = await camera.takePictureAsync(options);
    //   const base64 = data.base64;
    //   const disableLoading = () => setLoading(false);
    //   await getConfiguration()?.onDataObtained(base64, navigation, disableLoading);
    // } catch (error) {
    //   setLoading(false);
    //   Alert.alert('Hubo un error sacando la foto');
    // }

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
        <CameraViewOrPermissionMessage takePicture={takePicture} />
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
  takePicture: (camera: Camera) => Promise<void>
}

const CameraViewOrPermissionMessage = ({ takePicture }: CameraViewOrPermissionMessageProps) => {
  const devices = useCameraDevices();
  const cameraPermissionGranted = useCameraPermission();
  const device = devices.front;
  const camera = useRef<Camera>(null)

  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error)
  }, [])

  const isAppForeground = useIsAppForeground()
  console.log(`cameraPermissionGranted: ${cameraPermissionGranted}, isAppForeground: ${isAppForeground}`)

  if (!cameraPermissionGranted) {
    return (
      <Text>Se requieren los permisos de Cámara para continuar utilizando la aplicación</Text>
    )
  }

  if (device) {
    return (<>
      <Camera
        ref={camera}
        onError={onError}
        style={{ flex: 1 }}
        device={device}
        isActive={isAppForeground}
        photo={true}
      />
      <Icon
        name="camera"
        style={style().capture}
        onPress={async () => {
          if (camera.current === null) {
            return;
          }
          takePicture(camera.current)
        }}
      />
    </>
    );
  }

  return <></>
}


/**
 * Adds a `rotate` action of +90 degrees for manipulateAsync in case it is needed.
 * It is added in the case that the photo is `portrait` but its' width is bigger than its' height
 * This means that the saved photo orientation is incorrect and must be rotated
 * @param photo photo taken via react-native-vision-camera
 * @param photoActions 
 */
function addRotationIfWrongOrientation(photo: PhotoFile, photoActions: Action[]) {
  if (photo.orientation === 'portrait' && photo.width > photo.height ) {
    photoActions.push({ rotate: 90 })
  }
}
