import { InteractionManager } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import VerifyIdentityConfiguration from './vote_identity_configuration';

class QRScannerConfiguration extends TakePictureStepConfiguration {

  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(data: any, navigation: any, disableLoading: () => void) {
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

  static fromObject(object: any) {
    return new QRScannerConfiguration(object.description);
  }
}

export default QRScannerConfiguration;
