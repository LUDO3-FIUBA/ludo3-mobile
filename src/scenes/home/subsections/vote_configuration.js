import {InteractionManager} from 'react-native';
import {RNCamera} from 'react-native-camera';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import VerifyIdentityConfiguration from './vote_identity_configuration';

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
      title: 'Votar',
    });
    InteractionManager.runAfterInteractions(disableLoading);
  }

  toObject() {
    return super.toObject(Type.VoteQR, {});
  }

  static fromObject(object) {
    return new QRScannerConfiguration(object.description);
  }
}
