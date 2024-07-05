import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { evaluationsRepository, finalExamsRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';
import { EvaluationSubmission } from '../../../models';

class VerifyIdentityForEvaluationConfiguration extends TakePictureStepConfiguration {
  evaluationId: string;

  constructor(description: string, evaluationId: string) {
    super(description, 'front', false);
    this.evaluationId = evaluationId;
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(
      () => evaluationsRepository.submitEvaluation(this.evaluationId),
      navigation,
    )
      .then((evaluationSubmission: EvaluationSubmission) => {
        Alert.alert(
          'Éxito',
          `${evaluationSubmission.student.first_name} ${evaluationSubmission.student.last_name}\n(${evaluationSubmission.student.id})\nha entregado su examen.`,
          [
            {
              text: 'OK',
              onPress: () => {
                disableLoading();
                navigation.popToTop();
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      })
      .catch((error: any) => {
        // TODO: check error handling below
        console.log('Error', error);
        Alert.alert(
          'Error',
          'Hubo un error, no pudimos identificarte a vos o al exámen.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
          {
            cancelable: false,
          },
        );
        disableLoading();
      });
  }

  toObject() {
    return super.toObject(Type.EvaluationFace, {
      evaluationId: this.evaluationId,
    });
  }

  static fromObject(object: any) {
    return new VerifyIdentityForEvaluationConfiguration(
      object.description,
      object.evaluationId,
    );
  }
}

export default VerifyIdentityForEvaluationConfiguration;
