import { get, post } from './authenticatedRepository';
import { Career } from '../models/Career';

const domainUrl = 'api/students/careers';

export function getCareers(): Promise<Career[]> {
  return get(domainUrl).then(json => json as Career[]);
}

export function syncCareers(): Promise<Career[]> {
  return post(domainUrl, {}).then(json => json as Career[]);
}

export default { getCareers, syncCareers };
