import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../image_recognition/takePictureStepConfiguration';
import Type from '../image_recognition/takePictureStepConfigurationType';
import { authenticationRepository } from '../../repositories';


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
    this.images.push(image);

    if (this.descriptions.length === 0) {
      await this.submitRegistration(image, navigation, disableLoading);
    } else {
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

  private async submitRegistration(
    image: any,
    navigation: NavigationType,
    disableLoading: () => void,
    imageOverride: any = image
  ): Promise<void> {
    try {
      await authenticationRepository.preregister(
        this.dni,
        this.mail,
        this.padron,
        this.password,
        imageOverride
      );
      navigation.navigate('PreRegisterDone');
    } catch (error: any) {
      if (error instanceof authenticationRepository.InvalidImage) {
        this.promptRegisterWithoutFace(image, navigation, disableLoading);
        return;
      }
      if (error instanceof authenticationRepository.InvalidDNI) {
        Alert.alert(
          'DNI ya registrado',
          'Chequeá haberlo ingresado correctamente. De ser correcto, ' +
          'contactate con Admisión para resetear la cuenta asociada a este DNI.',
          [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
          { cancelable: false }
        );
      } else {
        console.error('[PreRegister] Error details:', JSON.stringify(error, null, 2));
        const errorMsg = error?.message || error?.toString() || 'Error desconocido';
        Alert.alert(
          'Error',
          `Hubo un error inesperado. Intenta nuevamente en unos minutos.\n\nDetalles: ${errorMsg}`,
          [{ text: 'OK', onPress: () => navigation.navigate('PreRegister') }],
          { cancelable: false }
        );
      }
    } finally {
      disableLoading();
    }
  }

  private promptRegisterWithoutFace(
    image: any,
    navigation: NavigationType,
    disableLoading: () => void
  ) {
    Alert.alert(
      'No pudimos detectar tu cara',
      'Podés registrarte igual, pero vas a tener que completar el registro facial ' +
      'desde tu perfil antes de poder dar presente en clases o finales.',
      [
        {
          text: 'Volver a intentar',
          onPress: () => {
            disableLoading();
            navigation.navigate('PreRegister');
          },
        },
        {
          text: 'Registrarme igual',
          onPress: async () => {
            // Retry registration without sending the image so the user is created with empty encodings.
            await this.submitRegistration(image, navigation, disableLoading, undefined);
          },
        },
      ],
      { cancelable: false }
    );
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
