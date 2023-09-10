// import { RNCamera } from 'react-native-camera';
import { Alert } from 'react-native';

interface TakePictureStepConfigurationParams {
  // Define your own types here
  [key: string]: any; // Replace with specific types as needed
}

interface TakePictureStepConfigurationObject {
  description: string;
  cameraType: any;
  searchForQRCode: boolean;
  type?: string;
}

export default class TakePictureStepConfiguration {
  description: string;
  cameraType: any;
  searchForQRCode: boolean;

  constructor(
    description = '',
    cameraType: any,
    searchForQRCode = false,
  ) {
    this.description = description;
    this.cameraType = cameraType;
    this.searchForQRCode = searchForQRCode;
  }

  // onDataObtained property will receive the base64 image string or the barcode string raw data
  async onDataObtained(data: string, navigation: any, disableLoading: () => void): Promise<void> { // Replace 'any' with the type you need
    Alert.alert(`Data received ${data}`);
    disableLoading();
  }

  toObject(type: string, params: TakePictureStepConfigurationParams): TakePictureStepConfigurationObject {
    return {
      description: this.description,
      cameraType: this.cameraType,
      searchForQRCode: this.searchForQRCode,
      type: type,
      ...params,
    };
  }

  static fromObject(object: any): TakePictureStepConfiguration {
    return new TakePictureStepConfiguration(
      object.description,
      object.cameraType,
      object.searchForQRCode,
    );
  }
}
