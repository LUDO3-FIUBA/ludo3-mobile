import FacePictureConfiguration from '../preregister/face_recognition';
import FinalExamQRConfiguration from '../home/subsections/final_exam_configuration';
import FinalExamFacePictureConfiguration from '../home/subsections/final_exam_identity_configuration';
import VerifyIdentityFacePictureConfiguration from '../home/subsections/verify_identity_configuration';
import VoteQRConfiguration from '../home/subsections/vote_configuration';
import VoteFacePictureConfiguration from '../home/subsections/vote_identity_configuration';
import TakePictureStepConfiguration from './takePictureStepConfiguration';

import Type from './takePictureStepConfigurationType';

interface TakePictureStepConfigurationObject {
  type: number;
  description?: string;
  cameraType?: any;  
  searchForQRCode?: boolean;
  
}

export default class TakePictureStepConfigurationFactory {
  static fromObject(object: TakePictureStepConfigurationObject): TakePictureStepConfiguration | FacePictureConfiguration | FinalExamQRConfiguration | FinalExamFacePictureConfiguration | VerifyIdentityFacePictureConfiguration | VoteQRConfiguration | VoteFacePictureConfiguration {
    if (object.type === Type.RegisterFace) {
      return FacePictureConfiguration.fromObject(object);
    } else if (object.type === Type.FinalExamQR) {
      return FinalExamQRConfiguration.fromObject(object);
    } else if (object.type === Type.FinalExamFace) {
      return FinalExamFacePictureConfiguration.fromObject(object);
    } else if (object.type === Type.VerifyIdentityFace) {
      return VerifyIdentityFacePictureConfiguration.fromObject(object);
    } else if (object.type === Type.VoteQR) {
      return VoteQRConfiguration.fromObject(object);
    } else if (object.type === Type.VoteFace) {
      return VoteFacePictureConfiguration.fromObject(object);
    } else {
      return TakePictureStepConfiguration.fromObject(object);
    }
  }
}
