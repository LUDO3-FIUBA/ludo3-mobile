import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../image_recognition/takePictureStepConfiguration';
import Type from '../image_recognition/takePictureStepConfigurationType';
import { authenticationRepository } from '../../repositories';


// Define type of the 'navigation' object if it's not defined elsewhere
interface NavigationType {
  navigate: (routeName: string, params?: any) => void;
  push: (routeName: string, params?: any) => void;
  reset: (options: any) => void;
}

export default class FacePictureConfiguration extends TakePictureStepConfiguration {
  descriptions: string[];
  dni: string;
  mail: string;
  images: any[];

  constructor(descriptions: string[], dni: string, mail: string, images: any[] = []) {
    super(descriptions.shift() || '', 'front', false);
    this.descriptions = descriptions;
    this.dni = dni;
    this.mail = mail;
    this.images = images;
  }

  async onDataObtained(
    image: any,
    navigation: NavigationType,
    disableLoading: () => void
  ): Promise<void> {
    this.images.push(image);
    if (this.descriptions.length === 0) {
      await authenticationRepository
        .preregister(this.dni, this.mail, image)
        .then(() => {
          disableLoading();
          navigation.navigate('PreRegisterDone');
        })
        .catch((error) => {
          disableLoading();
          if (error instanceof authenticationRepository.InvalidImage) {
            Alert.alert('Imagen inválida', 'Asegurate de que se vea bien tu cara.');
          } else if (error instanceof authenticationRepository.InvalidDNI) {
            Alert.alert(
              'DNI ya registrado',
              'Chequeá haberlo ingresado correctamente. De ser correcto, ' +
                'contactate con Admisión para resetear la cuenta asociada a este DNI.',
              [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
              {
                cancelable: false,
              }
            );
          } else {
            console.log('Error', error);
            Alert.alert(
              'Error',
              'Hubo un error inesperado. Intenta nuevamente en unos minutos.',
              [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
              {
                cancelable: false,
              }
            );
          }
        });
    } else {
      navigation.push('TakePicture', {
        configuration: new FacePictureConfiguration(
          this.descriptions,
          this.dni,
          this.mail,
          this.images
        ).toObject(),
        title: 'Pre-registro'
      });
      disableLoading();
    }
  }

  toObject(): any {
    return super.toObject(Type.RegisterFace, {
      descriptions: JSON.stringify(this.descriptions),
      dni: this.dni,
      mail: this.mail,
      images: this.images
    });
  }

  static fromObject(object: any): FacePictureConfiguration {
    const descriptions = JSON.parse(object.descriptions);
    descriptions.unshift(object.description);
    return new FacePictureConfiguration(
      descriptions,
      object.dni,
      object.mail,
      object.images
    );
  }
}
