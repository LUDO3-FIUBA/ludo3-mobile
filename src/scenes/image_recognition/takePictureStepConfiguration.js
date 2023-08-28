import {RNCamera} from 'react-native-camera';
import {Alert} from 'react-native';

export default class TakePictureStepConfiguration {
  constructor(
    description = '',
    cameraType = RNCamera.Constants.Type.front,
    searchForQRCode = false,
  ) {
    this.description = description;
    this.cameraType = cameraType;
    this.searchForQRCode = searchForQRCode;
  }

  // onDataObtained property will receive the base64 image string or the barcode string raw data
  async onDataObtained(data, navigation, disableLoading) {
    Alert.alert(`Data received ${data}`);
    disableLoading();
  }

  toObject(type, params) {
    return {
      description: this.description,
      cameraType: this.cameraType,
      searchForQRCode: this.searchForQRCode,
      type: type,
      ...params,
    };
  }

  static fromObject(object) {
    return new TakePictureStepConfiguration(
      object.description,
      object.cameraType,
      object.searchForQRCode,
    );
  }
}
