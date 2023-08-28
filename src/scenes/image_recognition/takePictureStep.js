import React, {Component} from 'react';
import {View, SafeAreaView, Text, ActivityIndicator, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Icon from 'react-native-vector-icons/Feather';
import {takePicture as style} from '../../styles';
import TakePictureStepConfiguration from './takePictureStepConfiguration';
import TakePictureStepConfigurationFactory from './takePictureStepConfigurationFactory';

Icon.loadFont();

export default class TakePictureStep extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false, ignoreReadings: false};
    this.configuration = null;
  }

  async onBarCodeRead(scanResult) {
    if (scanResult.data != null) {
      const {navigation} = this.props;
      this.setState({loading: true});
      const disableLoading = () => {
        this.setState({loading: false});
      };
      await this.getConfiguration().onDataObtained(
        scanResult.data,
        navigation,
        disableLoading,
      );
    }
  }

  componentDidMount() {
    this.observeScreenChangesIfNecessary();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData();
      this.observeScreenChangesIfNecessary();
    }
  }

  observeScreenChangesIfNecessary() {
    const configuration = this.getConfiguration();
    if (configuration.searchForQRCode) {
      this._focusUnsubscribe = this.props.navigation.addListener(
        'focus',
        () => {
          this.setState({ignoreReadings: false});
        },
      );
      this._blurUnsubscribe = this.props.navigation.addListener('blur', () => {
        this.setState({ignoreReadings: true});
      });
    } else {
      if (this._focusUnsubscribe) {
        this._focusUnsubscribe();
      }
      if (this._blurUnsubscribe) {
        this._blurUnsubscribe();
      }
      this.setState({ignoreReadings: false});
    }
  }

  getConfiguration() {
    if (this.configuration) {
      return this.configuration;
    }
    if (
      this.props.route &&
      this.props.route.params &&
      this.props.route.params.configuration
    ) {
      this.configuration = TakePictureStepConfigurationFactory.fromObject(
        this.props.route.params.configuration,
      );
    } else {
      this.configuration = this.props.configuration;
    }
    return this.configuration;
  }

  async takePicture(camera) {
    if (camera) {
      this.setState({loading: true});
      const options = {
        width: 180,
        quality: 0.3,
        base64: true,
        forceUpOrientation: true,
        fixOrientation: true,
        doNotSave: true,
        orientation: 'portrait',
      };
      var base64;
      try {
        const data = await camera.takePictureAsync(options);
        base64 = data.base64;
      } catch (error) {
        this.setState({loading: false});
        Alert.alert('Hubo un error sacando la foto');
        return;
      }
      const {navigation} = this.props;
      const disableLoading = () => {
        this.setState({loading: false});
      };
      await this.getConfiguration().onDataObtained(
        base64,
        navigation,
        disableLoading,
      );
    }
  }

  render() {
    const configuration = this.getConfiguration();
    const {loading, ignoreReadings} = this.state;
    return (
      <View style={style().view}>
        <SafeAreaView style={style().view}>
          <Text style={style().text}>{configuration.description}</Text>
          <RNCamera
            style={style().preview}
            type={configuration.cameraType}
            flashMode={RNCamera.Constants.FlashMode.off}
            captureAudio={false}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: `We need your permission to use your camera for ${
                configuration.searchForQRCode ? 'QR' : 'Face'
              } Recognition`,
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            barCodeTypes={
              configuration.searchForQRCode
                ? [RNCamera.Constants.BarCodeType.qr]
                : null
            }
            onBarCodeRead={
              configuration.searchForQRCode && !loading && !ignoreReadings
                ? scanResult => this.onBarCodeRead(scanResult)
                : null
            }>
            {({camera}) => (
              <View style={style().innerView}>
                {!configuration.searchForQRCode && (
                  <Icon
                    name="camera"
                    style={style().capture}
                    onPress={() => {
                      if (loading) {
                        return;
                      }
                      this.takePicture(camera);
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
          </RNCamera>
        </SafeAreaView>
      </View>
    );
  }
}

TakePictureStep.defaultProps = {
  configuration: new TakePictureStepConfiguration(),
};
