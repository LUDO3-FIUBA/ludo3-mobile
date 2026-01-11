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
  padron: string;
  password: string;
  images: any[];

  constructor(
    descriptions: string[],
    dni: string,
    mail: string,
    padron: string = '',
    password: string = '',
    images: any[] = []
  ) {
    super(descriptions.shift() || '', 'front', false);
    this.descriptions = descriptions;
    this.dni = dni;
    this.mail = mail;
    this.padron = padron;
    this.password = password;
    this.images = images;
  }

  async onDataObtained(
    image: any,
    navigation: NavigationType,
    disableLoading: () => void
  ): Promise<void> {
    console.log('[FacePictureConfig] onDataObtained called');
    console.log('[FacePictureConfig] descriptions.length:', this.descriptions.length);
    console.log('[FacePictureConfig] images.length before push:', this.images.length);
    
    this.images.push(image);
    
    if (this.descriptions.length === 0) {
      console.log('[FacePictureConfig] No more descriptions, calling preregister');
      console.log('[FacePictureConfig] DNI:', this.dni, 'Email:', this.mail, 'Padron:', this.padron);
      
      await authenticationRepository
        .preregister(this.dni, this.mail, this.padron, this.password, image)
        .then(() => {
          console.log('[FacePictureConfig] Preregister successful, navigating to PreRegisterDone');
          navigation.navigate('PreRegisterDone');
          disableLoading();
        })
        .catch((error) => {
          console.log('[FacePictureConfig] Preregister failed:', error);
          
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
            console.error('[PreRegister] Error details:', JSON.stringify(error, null, 2));
            const errorMsg = error?.message || error?.toString() || 'Error desconocido';
            Alert.alert(
              'Error',
              `Hubo un error inesperado. Intenta nuevamente en unos minutos.\n\nDetalles: ${errorMsg}`,
              [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
              {
                cancelable: false,
              }
            );
          }
          disableLoading();
        });
    } else {
      console.log('[FacePictureConfig] More descriptions remaining, navigating to next TakePicture');
      navigation.push('TakePicture', {
        configuration: new FacePictureConfiguration(
          this.descriptions,
          this.dni,
          this.mail,
          this.padron,
          this.password,
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
      padron: this.padron,
      password: this.password,
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
      object.padron,
      object.password,
      object.images
    );
  }
}
