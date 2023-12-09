import { InteractionManager } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import VerifyIdentityConfiguration from './final_exam_identity_configuration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { QRCode, QrCodeType, parseQrCodeData } from '../../../models';

class QRScannerConfiguration extends TakePictureStepConfiguration {
  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(qrCodeRawData: any, navigation: any, disableLoading: () => void) {
    try {
      const qrCode = parseQrCodeData(qrCodeRawData);
      switch (qrCode.type) {
        case QrCodeType.FinalExamUuid:
          await this.onScannedFinalExam(navigation, qrCode);
          break;
        case QrCodeType.ExamUuid:
          // TODO: SUBMIT EXAM VIA /api/evaluations/submissions/submit_evaluation/
          break;
        default:
          // TODO: SHOW MESSAGE FOR UNSUPPORTED TYPE
          break;
      }
    } catch (error) {
      // TODO: HANDLE ERROR ON PARSE OR SUBMIT
    }

    InteractionManager.runAfterInteractions(disableLoading);
  }

  private async onScannedFinalExam(navigation: any, qrCode: QRCode) {
    await navigation.navigate('TakePicture', {
      configuration: new VerifyIdentityConfiguration(
        'Verifiquemos tu identidad',
        qrCode.parsedUuid
      ).toObject(),
      title: 'Rendir final',
    });
  }

  toObject() {
    return super.toObject(Type.ScanQR, {});
  }

  static fromObject(object: any) {
    return new QRScannerConfiguration(object.description);
  }
}

export default QRScannerConfiguration;
