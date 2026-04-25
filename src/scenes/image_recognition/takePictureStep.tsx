import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';
import { Camera, Code } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { Loading } from '../../components';
import CameraWithPermissions from './camera/CameraWithPermissions';


interface TakePictureStepProps {
  configuration?: TakePictureStepConfiguration;
}

const TakePictureStep: React.FC<TakePictureStepProps> = ({ configuration: propConfiguration = new TakePictureStepConfiguration() }) => {
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
      const filePath = photo.path.startsWith('file://') ? photo.path.replace('file://', '') : photo.path;
      const rawBase64 = await RNFS.readFile(filePath, 'base64');
      const base64string = `data:image/jpeg;base64,${rawBase64}`
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

export default TakePictureStep;

