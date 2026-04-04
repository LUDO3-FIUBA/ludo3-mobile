import { Alert, InteractionManager } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import VerifyIdentityForExamConfiguration from './final_exam_identity_configuration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { Attendance, Evaluation, QRCode, qrCodeUtils } from '../../../models';
import { makeRequest } from '../../authenticatedComponent';
import { attendanceRepository, evaluationsRepository } from '../../../repositories';


class QRScannerConfiguration extends TakePictureStepConfiguration {
  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(qrCodeRawData: any, navigation: any, disableLoading: () => void) {
    try {
      const qrCode = qrCodeUtils.parseQrCodeData(qrCodeRawData);
      console.log(`QRScannerConfiguration - Detected ${qrCode.type} code type`);
      switch (qrCode.type) {
        case qrCodeUtils.QRCodeType.FinalExamUuid:
          await this.onScannedFinalExam(navigation, qrCode);
          break;
        case qrCodeUtils.QRCodeType.EvaluationUuid:
          await this.onScannedEvaluation(navigation, qrCode);
          break;
        case qrCodeUtils.QRCodeType.AttendanceUuid:
          await this.onScannedAttendance(navigation, qrCode, disableLoading);
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
    const parsedEvaluationId = qrCode.parsedUuid?.trim();

    if (parsedEvaluationId) {
      try {
        const evaluations = await makeRequest(
          () => evaluationsRepository.fetchMisExamenes(),
          navigation,
        ) as Evaluation[];

        const scannedEvaluation = evaluations.find(
          (evaluation) => String(evaluation.id) === parsedEvaluationId,
        );

        if (scannedEvaluation) {
          await navigation.navigate('AddEvaluationSubmission', {
            evaluation: scannedEvaluation,
          });
          return;
        }

        showNonCancelablealert(
          'Evaluación no encontrada',
          'No pudimos encontrar esta evaluación para cargar la entrega. Intenta nuevamente en unos minutos.',
          () => navigation.popToTop(),
        );
        return;
      } catch (error) {
        console.log('Error al verificar requisitos del examen', error);
        showNonCancelablealert(
          'Error',
          'No pudimos cargar la evaluación escaneada. Intenta nuevamente en unos minutos.',
          () => navigation.popToTop(),
        );
        return;
      }
    }

    showNonCancelablealert(
      'QR inválido',
      'El código QR de evaluación no es válido.',
      () => navigation.popToTop(),
    );
  }

  private async onScannedAttendance(navigation: any, qrCode: QRCode, disableLoading: () => void) {
    try {
      const attendance: Attendance = await makeRequest(
        () => attendanceRepository.submitAttendance(qrCode.parsedUuid),
        navigation,
      )
      showNonCancelablealert(
        'Éxito',
        `Confirmaste asistencia en ${attendance.semester.commission.subject_name}.`,
        disableLoading
      );
    } catch (error) {
      console.log('Error', error);
      // TODO: more verbose errors (i.e. QR ya escaneado, no estas inscripto en este semestre, etc.)
      showNonCancelablealert(
        'Error',
        'Hubo un error, no pudimos confirmar tu asistencia. Por favor intentá nuevamente.',
        disableLoading,
      );
    }
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
