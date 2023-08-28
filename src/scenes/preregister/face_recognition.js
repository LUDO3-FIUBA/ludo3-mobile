import {Alert} from 'react-native';
import TakePictureStepConfiguration from '../image_recognition/takePictureStepConfiguration';
import Type from '../image_recognition/takePictureStepConfigurationType';
import {authenticationRepository} from '../../repositories';

export default class FacePictureConfiguration extends TakePictureStepConfiguration {
  constructor(descriptions, dni, mail, images = []) {
    super(descriptions.shift());
    this.descriptions = descriptions;
    this.dni = dni;
    this.mail = mail;
    this.images = images;
  }

  async onDataObtained(image, navigation, disableLoading) {
    this.images.push(image);
    if (this.descriptions.length === 0) {
      await authenticationRepository
        .preregister(this.dni, this.mail, image)
        .then(() => {
          disableLoading();
          navigation.navigate('PreRegisterDone');
        })
        .catch(error => {
          disableLoading();
          if (error instanceof authenticationRepository.InvalidImage) {
            Alert.alert(
              'Imagen inválida',
              'Asegurate de que se vea bien tu cara.',
            );
          } else if (error instanceof authenticationRepository.InvalidDNI) {
            Alert.alert(
              'DNI ya registrado',
              'Chequeá haberlo ingresado correctamente. De ser correcto, ' +
                'contactate con Admisión para resetear la cuenta asociada a este DNI.',
              [{text: 'OK', onPress: () => navigation.navigate('PreRegister')}],
              {
                cancelable: false,
              },
            );
          } else {
            console.log('Error', error);
            Alert.alert(
              'Error',
              'Hubo un error inesperado. Intenta nuevamente en unos minutos.',
              [{text: 'OK', onPress: () => navigation.navigate('PreRegister')}],
              {
                cancelable: false,
              },
            );
          }
        });
    } else {
      navigation.push('TakePicture', {
        configuration: new FacePictureConfiguration(
          this.descriptions,
          this.dni,
          this.mail,
          this.images,
        ).toObject(),
        title: 'Pre-registro',
      });
      disableLoading();
    }
  }

  toObject() {
    return super.toObject(Type.RegisterFace, {
      descriptions: JSON.stringify(this.descriptions),
      dni: this.dni,
      mail: this.mail,
      images: this.images,
    });
  }

  static fromObject(object) {
    var descriptions = JSON.parse(object.descriptions);
    descriptions.unshift(object.description);
    return new FacePictureConfiguration(
      descriptions,
      object.dni,
      object.mail,
      object.images,
    );
  }
}
