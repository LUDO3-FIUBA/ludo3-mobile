import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../image_recognition/takePictureStepConfiguration';
import Type from '../image_recognition/takePictureStepConfigurationType';
import { usersRepository } from '../../repositories';
import { makeRequest } from '../authenticatedComponent';

class CompleteFaceRegistrationConfiguration extends TakePictureStepConfiguration {
  constructor(description: string) {
    super(description, 'front', false);
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(() => usersRepository.registerFace(image), navigation)
      .then(() => {
        Alert.alert(
          'Listo',
          'Tu registro facial quedó completo. Ya podés usar la función de dar presente.',
          [
            {
              text: 'OK',
              onPress: () => {
                disableLoading();
                navigation.popToTop();
              },
            },
          ],
          { cancelable: false },
        );
      })
      .catch((error: any) => {
        disableLoading();
        if (error instanceof usersRepository.InvalidImage) {
          Alert.alert(
            'No pudimos detectar tu cara',
            'Asegurate de que se vea bien tu cara en la foto y volvé a intentar.',
          );
        } else {
          console.log('Error', error);
          Alert.alert(
            'Error',
            'Hubo un error completando tu registro facial. Intentá de nuevo en unos minutos.',
          );
        }
      });
  }

  toObject() {
    return super.toObject(Type.CompleteFaceRegistration, {});
  }

  static fromObject(object: any) {
    return new CompleteFaceRegistrationConfiguration(object.description);
  }
}

export default CompleteFaceRegistrationConfiguration;
