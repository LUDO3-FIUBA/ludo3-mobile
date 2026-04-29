import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { finalExamsRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';

class VerifyIdentityForExamConfiguration extends TakePictureStepConfiguration {
  finalId: string;

  constructor(description: string, finalId: string) {
    super(description, 'front', false);
    this.finalId = finalId;
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(
      () => finalExamsRepository.submitExam(this.finalId, image),
      navigation,
    )
      .then((user: { fullName: () => any; id: () => any; }) => {
        Alert.alert(
          'Éxito',
          `Entrega realizada con éxito.`,
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
        } else if (error instanceof finalExamsRepository.FaceRegistrationPending) {
          Alert.alert(
            'Registro facial incompleto',
            'Todavía no completaste tu registro facial. Completálo para poder rendir el final.',
            [
              {
                text: 'Completar ahora',
                onPress: () => {
                  navigation.navigate('CompleteFaceRegistration');
                },
              },
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: false },
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
    return super.toObject(Type.FinalExamFace, {
      finalId: this.finalId,
    });
  }

  static fromObject(object: any) {
    return new VerifyIdentityForExamConfiguration(
      object.description,
      object.finalId,
    );
  }
}

export default VerifyIdentityForExamConfiguration;
