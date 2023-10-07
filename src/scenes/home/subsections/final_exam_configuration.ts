import { InteractionManager } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import VerifyIdentityConfiguration from './final_exam_identity_configuration';
import Type from '../../image_recognition/takePictureStepConfigurationType';

class QRScannerConfiguration extends TakePictureStepConfiguration {
  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(qrCodeData: any, navigation: any, disableLoading: () => void) {
    await navigation.navigate('TakePicture', {
      configuration: new VerifyIdentityConfiguration(
        'Verifiquemos tu identidad',
        qrCodeData,
      ).toObject(),
      title: 'Rendir final',
    });
    InteractionManager.runAfterInteractions(disableLoading);
  }

  toObject() {
    return super.toObject(Type.FinalExamQR, {});
  }

  static fromObject(object: any) {
    return new QRScannerConfiguration(object.description);
  }
}

export default QRScannerConfiguration;
