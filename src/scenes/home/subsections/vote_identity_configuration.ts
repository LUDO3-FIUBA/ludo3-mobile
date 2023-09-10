import { Alert } from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import { votingRepository } from '../../../repositories';
import { makeRequest } from '../../authenticatedComponent';

class VerifyIdentityConfiguration extends TakePictureStepConfiguration {
  token: string;

  constructor(description: string, token: string) {
    super(description, 'back', false);
    this.token = token;
  }

  async onDataObtained(image: any, navigation: any, disableLoading: () => void) {
    await makeRequest(
      () => votingRepository.redeemVote(this.token, image),
      navigation,
    )
      .then(() => {
        Alert.alert(
          'Éxito',
          'Has votado',
          [
            {
              text: 'OK',
              onPress: () => {
                disableLoading();
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
        if (error instanceof votingRepository.IdentityFail) {
          Alert.alert(
            '¡No sos quien decís ser!',
            'O no hemos podido reconocerte. Intentá de nuevo.',
          );
        } else if (error instanceof votingRepository.NotAVotingTable) {
          Alert.alert(
            'QR inválido',
            'No encontramos ninguna mesa de votación activa que corresponda ' +
              'a ese QR. Cualquier cosa, intentá de nuevo.',
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
            'Hubo un error, no pudimos identificarte a vos o a la mesa de ' +
              'votación.',
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
    return super.toObject(String(Type.VoteFace), {
      token: this.token,
    });
  }

  static fromObject(object: any) {
    return new VerifyIdentityConfiguration(object.description, object.token);
  }
}

export default VerifyIdentityConfiguration;
