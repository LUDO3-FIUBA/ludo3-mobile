import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { finalExamsRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';

class VerifyIdentityForExamConfiguration extends TakePictureStepConfiguration {
  token: string;

  constructor(description: string, token: string) {
    super(description, 'back', false);
    this.token = token;
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(
      () => finalExamsRepository.submitExam(this.token, image),
      navigation,
    )
      .then((user: { fullName: () => any; id: () => any; }) => {
        Alert.alert(
          'Éxito',
          `${user.fullName()}\n(${user.id()})\nha entregado su examen.`,
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
        disableLoading();
        if (error instanceof finalExamsRepository.IdentityFail) {
          Alert.alert(
            '¡No sos quien decís ser!',
            'O no hemos podido reconocerte. Intentá de nuevo.',
          );
        } else if (error instanceof finalExamsRepository.NotAFinal) {
          Alert.alert(
            'QR inválido',
            'No encontramos ningún final activo que corresponda a ese QR. ' +
              'Cualquier cosa, intentá de nuevo.',
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
        } else {
          console.log('Error', error);
          Alert.alert(
            'Error',
            'Hubo un error, no pudimos identificarte a vos o al final.',
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
        }
      });
  }

  toObject() {
    return super.toObject(String(Type.FinalExamFace), {
      token: this.token,
    });
  }

  static fromObject(object: any) {
    return new VerifyIdentityForExamConfiguration(
      object.description,
      object.token,
    );
  }
}

export default VerifyIdentityForExamConfiguration;
