import FacePictureConfiguration from '../preregister/face_recognition';
import QRScannerConfiguration from '../home/subsections/scan_qr_configuration';
import FinalExamFacePictureConfiguration from '../home/subsections/final_exam_identity_configuration';
import VerifyIdentityFacePictureConfiguration from '../home/subsections/verify_identity_configuration';
import TakePictureStepConfiguration from './takePictureStepConfiguration';

import Type from './takePictureStepConfigurationType';

interface TakePictureStepConfigurationObject {
  type: number;
  description?: string;
  cameraType?: any;  
  searchForQRCode?: boolean;
  
}

export default class TakePictureStepConfigurationFactory {
  static fromObject(object: TakePictureStepConfigurationObject): TakePictureStepConfiguration | FacePictureConfiguration | QRScannerConfiguration | FinalExamFacePictureConfiguration | VerifyIdentityFacePictureConfiguration {
    if (object.type === Type.RegisterFace) {
      return FacePictureConfiguration.fromObject(object);
    } else if (object.type === Type.ScanQR) {
      return QRScannerConfiguration.fromObject(object);
    } else if (object.type === Type.FinalExamFace) {
      return FinalExamFacePictureConfiguration.fromObject(object);
    } else if (object.type === Type.VerifyIdentityFace) {
      return VerifyIdentityFacePictureConfiguration.fromObject(object);
    } else {
      return TakePictureStepConfiguration.fromObject(object);
    }
  }
}
