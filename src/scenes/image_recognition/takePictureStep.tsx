import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { takePicture as style } from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';

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

  const onBarCodeRead = async (scanResult: any) => {
    if (scanResult.data != null) {
      setLoading(true);
      const disableLoading = () => setLoading(false);
      await getConfiguration()?.onDataObtained(scanResult.data, navigation, disableLoading);
    }
  };

  // const takePicture = async (camera: any) => {
  //   const options = {
  //     width: 180,
  //     quality: 0.3,
  //     base64: true,
  //     forceUpOrientation: true,
  //     fixOrientation: true,
  //     doNotSave: true,
  //     orientation: 'portrait',
  //   };

  //   setLoading(true);

  //   try {
  //     const data = await camera.takePictureAsync(options);
  //     const base64 = data.base64;
  //     const disableLoading = () => setLoading(false);
  //     await getConfiguration()?.onDataObtained(base64, navigation, disableLoading);
  //   } catch (error) {
  //     setLoading(false);
  //     Alert.alert('Hubo un error sacando la foto');
  //   }
  // };

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

  const config = getConfiguration();
  if (!config) return null;

  return (
    <View style={style().view}>
      <SafeAreaView style={style().view}>
        <Text style={style().text}>{config.description}</Text>
        {/* <RNCamera
          style={style().preview}
          type={config.cameraType}
          flashMode={RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: `We need your permission to use your camera for ${config.searchForQRCode ? 'QR' : 'Face'} Recognition`,
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          barCodeTypes={config.searchForQRCode ? [RNCamera.Constants.BarCodeType.qr] : null}
          onBarCodeRead={
            config.searchForQRCode && !loading && !ignoreReadings
              ? (scanResult: any) => onBarCodeRead(scanResult)
              : null
          }>
          {({ camera }: any) => (
            <View style={style().innerView}>
              {!config.searchForQRCode && (
                <Icon
                  name="camera"
                  style={style().capture}
                  onPress={() => {
                    if (loading) {
                      return;
                    }
                    takePicture(camera);
                  }}
                />
              )}
              {loading && (
                <View style={style().loadingContainer}>
                  <View style={style().loadingBackground}>
                    <ActivityIndicator color="#A9A9A9" size="large" />
                  </View>
                </View>
              )}
            </View>
          )}
        </RNCamera> */}
      </SafeAreaView>
    </View>
  );
};

TakePictureStep.defaultProps = {
  configuration: new TakePictureStepConfiguration(),
};

export default TakePictureStep;
