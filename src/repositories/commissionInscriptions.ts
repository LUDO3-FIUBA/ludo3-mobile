import { get } from './authenticatedRepository';
import { CommissionInscription } from '../models';

const domainUrl = 'api/commission_inscription';

async function fetchCurrentInscriptions(): Promise<CommissionInscription[]> {
    return get(`${domainUrl}/current_inscriptions`)
        .catch(error => {
            // if (error instanceof StatusCodeError && error.code == 404) {
            //     return Promise.reject(new NotASubject());
            // }
            return Promise.reject(error);
        })
        .then(json => Promise.resolve(convertJsonToCommissionInscriptionsList(json)));
}

function convertJsonToCommissionInscriptionsList(json: any): CommissionInscription[] {
    return json
        ? json.map((commissionInscription: any) =>
            <CommissionInscription>commissionInscription)
        : [];
}

export default {
    fetchCurrentInscriptions,
};
