import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';
import { Camera, Code, PhotoFile } from 'react-native-vision-camera';
import { manipulateAsync, Action } from 'expo-image-manipulator';
import { Loading } from '../../components';
import CameraWithPermissions from './camera/CameraWithPermissions';

Icon.loadFont();

interface TakePictureStepProps {
  configuration?: TakePictureStepConfiguration;
}

const TakePictureStep: React.FC<TakePictureStepProps> = ({ configuration: propConfiguration }) => {
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

  const onBarCodeRead = async (codes: Code[]) => {
    console.log(`QR CODE SCANNER: ${JSON.stringify(codes)}`)
    if (codes.length !== 0) {
      setIgnoreReadings(true);
      setLoading(true);
      const disableLoading = () => { setLoading(false); setIgnoreReadings(false) };
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
        <CameraWithPermissions
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

export default TakePictureStep;

/**
 * Adds a `rotate` action of +90 degrees for manipulateAsync in case it is needed.
 * It is added in the case that the photo is `portrait` but its' width is bigger than its' height
 * This means that the saved photo orientation is incorrect and must be rotated
 * @param photo photo taken via react-native-vision-camera
 * @param photoActions 
 */
function addRotationIfWrongOrientation(photo: PhotoFile, photoActions: Action[]) {
  if (photo.width > photo.height) {
    photoActions.push({ rotate: 90 })
  }
}
