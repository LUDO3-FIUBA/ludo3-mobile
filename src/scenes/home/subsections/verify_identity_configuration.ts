import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { usersRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';

class VerifyIdentityConfiguration extends TakePictureStepConfiguration {
  
  constructor(description: string) {
    super(description, 'back', true);
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(() => usersRepository.validate(image), navigation)
      .then((user: { fullName: () => any; id: () => any; }) => {
        disableLoading();
        Alert.alert('Éxito', `Sos:\n${user.fullName()}\n(${user.id()})`);
      })
      .catch((error: any) => {
        disableLoading();
        if (error instanceof usersRepository.IdentityFail) {
          Alert.alert('Error', '¡No sos quien decís ser!');
        } else {
          console.log('Error', error);
          Alert.alert('Error', 'Hubo un error, no pudimos identificarte.');
        }
      });
  }

  toObject() {
    return super.toObject(String(Type.VerifyIdentityFace), {});
  }

  static fromObject(object: any) {
    return new VerifyIdentityConfiguration(object.description);
  }
}

export default VerifyIdentityConfiguration;
