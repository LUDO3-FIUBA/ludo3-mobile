import {InteractionManager} from 'react-native';
import {RNCamera} from 'react-native-camera';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import VerifyIdentityConfiguration from './final_exam_identity_configuration';
import Type from '../../image_recognition/takePictureStepConfigurationType';

export default class QRScannerConfiguration extends TakePictureStepConfiguration {
  constructor(description) {
    super(description, RNCamera.Constants.Type.back, true);
  }

  async onDataObtained(data, navigation, disableLoading) {
    await navigation.push('TakePicture', {
      configuration: new VerifyIdentityConfiguration(
        'Verifiquemos tu identidad',
        data,
      ).toObject(),
      title: 'Rendir final',
    });
    InteractionManager.runAfterInteractions(disableLoading);
  }

  toObject() {
    return super.toObject(Type.FinalExamQR, {});
  }

  static fromObject(object) {
    return new QRScannerConfiguration(object.description);
  }
}
