import {Alert} from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import {usersRepository} from '../../../repositories';
import {makeRequest} from '../../authenticatedComponent';

export default class VerifyIdentityConfiguration extends TakePictureStepConfiguration {
  constructor(description) {
    super(description);
  }

  async onDataObtained(image, navigation, disableLoading) {
    await makeRequest(() => usersRepository.validate(image), navigation)
      .then(user => {
        disableLoading();
        Alert.alert('Éxito', `Sos:\n${user.fullName()}\n(${user.id()})`);
      })
      .catch(error => {
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
    return super.toObject(Type.VerifyIdentityFace, {});
  }

  static fromObject(object) {
    return new VerifyIdentityConfiguration(object.description);
  }
}
