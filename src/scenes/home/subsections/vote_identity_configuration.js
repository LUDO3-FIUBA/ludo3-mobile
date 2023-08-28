import {Alert} from 'react-native';
import TakePictureStepConfiguration from '../../image_recognition/takePictureStepConfiguration';
import Type from '../../image_recognition/takePictureStepConfigurationType';
import {votingRepository} from '../../../repositories';
import {makeRequest} from '../../authenticatedComponent';

export default class VerifyIdentityConfiguration extends TakePictureStepConfiguration {
  constructor(description, token) {
    super(description);
    this.token = token;
  }

  async onDataObtained(image, navigation, disableLoading) {
    await makeRequest(
      () => votingRepository.redeemVote(this.token, image),
      navigation,
    )
      .then(response => {
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
      .catch(error => {
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
    return super.toObject(Type.VoteFace, {
      token: this.token,
    });
  }

  static fromObject(object) {
    return new VerifyIdentityConfiguration(object.description, object.token);
  }
}
