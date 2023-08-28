import {StatusCodeError} from '../networking';

export class IdentityFail extends Error {
  constructor() {
    super('No eres quien dices ser.');
    this.name = 'IdentityValidationFail';
  }
}

export class NotAVotingTable extends Error {
  constructor() {
    super('No es un QR válido para votación.');
    this.name = 'NotAValidVotingTable';
  }
}

export function redeemVote(votingId: string, image: string): Promise<boolean> {
  return Promise.resolve(true).catch(error => {
    if (
      error instanceof StatusCodeError &&
      error.isBecauseOf('invalid_image')
    ) {
      // No face detected error or not valid face
      return Promise.reject(new IdentityFail());
    } else if (error instanceof StatusCodeError && error.code == 404) {
      return Promise.reject(new NotAVotingTable());
    }
    return Promise.reject(error);
  });
}

export default {redeemVote, IdentityFail, NotAVotingTable};
