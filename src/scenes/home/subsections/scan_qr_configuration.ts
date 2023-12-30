import { Alert, InteractionManager } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import VerifyIdentityForExamConfiguration from './final_exam_identity_configuration';
import VerifyIdentityForEvaluationConfiguration from './evaluation_identity_configuration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { QRCode, qrCodeUtils } from '../../../models';

class QRScannerConfiguration extends TakePictureStepConfiguration {
  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(qrCodeRawData: any, navigation: any, disableLoading: () => void) {
    try {
      const qrCode = qrCodeUtils.parseQrCodeData(qrCodeRawData);
      console.log(`QRScannerConfiguration - Detected ${qrCode} code type`);
      switch (qrCode.type) {
        case qrCodeUtils.QRCodeType.FinalExamUuid:
          await this.onScannedFinalExam(navigation, qrCode);
          break;
        case qrCodeUtils.QRCodeType.EvaluationUuid:
          await this.onScannedEvaluation(navigation, qrCode);
          break;
        case qrCodeUtils.QRCodeType.AssistanceUuid:
          showNonCancelablealert(
            'Proximamente',
            'TODO: completar para otros codigos',
            disableLoading
          );
          break;
      }
    } catch (error) {
      console.error(`QRScannerConfiguration - Error ${error}`);
      if (error instanceof qrCodeUtils.UnsupportedQRSchema) {
        showNonCancelablealert(
          'QR no soportado',
          'Este código no está soportado por LUDO. Asegurate de usar un código generado por un docente e intentá nuevamente.',
          disableLoading
        );
      } else {
        showNonCancelablealert(
          'Error al escanear código',
          'Por favor, intentá nuevamente.',
          disableLoading
        );
      }
    }

  }

  private async onScannedFinalExam(navigation: any, qrCode: QRCode) {
    await navigation.navigate('TakePicture', {
      configuration: new VerifyIdentityForExamConfiguration(
        'Verifiquemos tu identidad',
        qrCode.parsedUuid
      ).toObject(),
      title: 'Rendir final',
    });
  }

  private async onScannedEvaluation(navigation: any, qrCode: QRCode) {
    await navigation.navigate('TakePicture', {
      configuration: new VerifyIdentityForEvaluationConfiguration(
        'Verifiquemos tu identidad',
        qrCode.parsedUuid
      ).toObject(),
      title: 'Rendir exámen',
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


function showNonCancelablealert(alertTitle: string, alertDesc: string, disableLoading: () => void) {
  Alert.alert(
    alertTitle,
    alertDesc,
    [
      {
        text: 'OK',
        onPress: () => {
          InteractionManager.runAfterInteractions(disableLoading);
        },
      },
    ],
    {
      cancelable: false,
    }
  );
}
