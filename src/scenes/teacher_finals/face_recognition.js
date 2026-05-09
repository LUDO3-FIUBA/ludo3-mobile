import {Alert} from 'react-native';
import TakePictureStepConfiguration from '../image_recognition/takePictureStepConfiguration';
import Type from '../image_recognition/takePictureStepConfigurationType';
import {teacherFinalsRepository} from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';

export default class FacePictureConfiguration extends TakePictureStepConfiguration {
  constructor(finalId) {
    super('Verifiquemos tu identidad para poder cerrar el acta.');
    this.finalId = finalId;
  }

  async onDataObtained(image, navigation, disableLoading) {
    makeRequest(() => teacherFinalsRepository.sendAct(this.finalId, image), navigation)
      .then(() => {
        navigation.pop(2);
      })
      .catch(error => {
        console.error(error)
        if (error instanceof teacherFinalsRepository.IdentityFail) {
          Alert.alert(
            '¡No sos quien decís ser!',
            'O no hemos podido reconocerte. Intentá de nuevo.',
          );
        } else if (error instanceof teacherFinalsRepository.FaceRegistrationPending) {
          Alert.alert(
            'Registro facial incompleto',
            'Todavía no completaste tu registro facial. Completálo para poder cerrar el acta.',
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
                onPress: () => navigation.pop(),
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            'Error',
            'Hubo un error inesperado. Intenta nuevamente en unos minutos.',
          );
          navigation.pop();
        }
        disableLoading();
      });
  }

  toObject() {
    return super.toObject(Type.ActClosing, {
      finalId: this.finalId,
    });
  }

  static fromObject(object) {
    return new FacePictureConfiguration(object.finalId);
  }
}
