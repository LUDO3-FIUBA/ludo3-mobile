import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { usersRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';

class VerifyIdentityConfiguration extends TakePictureStepConfiguration {
  
  constructor(description: string) {
    super(description, 'front', false);
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(() => usersRepository.validate(image), navigation)
      .then((user: { fullName: () => any; id: () => any; }) => {
        Alert.alert('Éxito', `Sos:\n${user.fullName()}\n(${user.id()})`);
        disableLoading();
      })
      .catch((error: any) => {
        if (error instanceof usersRepository.IdentityFail) {
          Alert.alert('Error', '¡No sos quien decís ser!');
        } else if (error instanceof usersRepository.FaceRegistrationPending) {
          Alert.alert(
            'Registro facial incompleto',
            'Todavía no completaste tu registro facial. Completálo para continuar.',
            [
              {
                text: 'Completar ahora',
                onPress: () => {
                  navigation.navigate('CompleteFaceRegistration');
                },
              },
              { text: 'Cancelar', style: 'cancel' },
            ],
          );
        } else {
          console.log('Error', error);
          Alert.alert('Error', 'Hubo un error, no pudimos identificarte.');
        }
        disableLoading();
      });
  }

  toObject() {
    return super.toObject(Type.VerifyIdentityFace, {});
  }

  static fromObject(object: any) {
    return new VerifyIdentityConfiguration(object.description);
  }
}

export default VerifyIdentityConfiguration;
