import { API_URL } from "@env";

export const baseUrl = API_URL || 'http://example.com:8007';

const logRequests = true;

export class StatusCodeError extends Error {
  code: number;
  info: any;
  json: any;
  constructor(statusCode: number, info = '<not available>') {
    super(`Invalid response with status code ${statusCode}.
      More information: ${JSON.stringify(info)}`);
    this.name = 'StatusCodeError';
    this.code = statusCode;
    this.info = info;
  }

  isBecauseOf(internalErrorCode: string) { 
    return (
      this.info.code === internalErrorCode ||
      (this.info.some && this.info.some((e: any) => e.code === internalErrorCode))
    );
  }

  fieldErrorIsBecauseOf(field: string, internalErrorCode: any) {
    return (
      (this.info[field] && this.info[field].code === internalErrorCode) ||
      (this.info[field].some &&
        this.info[field].some((e: any) => e.code === internalErrorCode))
    );
  }
}

export function validate(response: any) {
  if (response.status >= 200 && response.status < 300) {
    return response.text().then((text: string) => {
      const result = text.length ? JSON.parse(text) : {};
      if (logRequests) {
        console.log(`RESPONSE\n${JSON.stringify(result)}`);
      }
      return result;
    });
  }
  return response
    .json()
    .catch(() => {
      if (logRequests) {
        console.log(`RESPONSE: ${response.status}`);
      }
      return Promise.reject(new StatusCodeError(response.status));
    })
    .then((json: string) => {
      const result = JSON.stringify(json);
      if (logRequests) {
        console.log(`RESPONSE: ${response.status}\n${result}`);
      }
      return Promise.reject(new StatusCodeError(response.status, json));
    });
}

export function post(url: string, body: any, queryParams = [], headers = {}) {
  const reducer = (acc: any, param: any) => `${acc}&${param.key}=${param.value}`;
  const queryParamsString = `?${queryParams.reduce(reducer, '')}`;
  if (logRequests) {
    if (body) {
      console.log(
        `POST ${baseUrl}/${url}/${queryParamsString}\n${JSON.stringify(body)}`,
      );
    } else {
      console.log(`POST ${baseUrl}/${url}/${queryParamsString}`);
    }
  }
  return fetch(`${baseUrl}/${url}/${queryParamsString}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }).then(res => validate(res));
}

export function get(url: string, queryParams: any[] = [], headers = {}) {
  const reducer = (acc: any, param: any) => `${acc}&${param.key}=${param.value}`;
  const queryParamsString = `?${queryParams.reduce(reducer, '')}`;
  if (logRequests) {
    console.log(`GET ${baseUrl}/${url}/${queryParamsString}`);
  }
  return fetch(`${baseUrl}/${url}/${queryParamsString}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  }).then(res => validate(res));
}

export function put(url: string, body: any, queryParams = [], headers = {}) {
  const reducer = (acc: any, param: any) => `${acc}&${param.key}=${param.value}`;
  const queryParamsString = `?${queryParams.reduce(reducer, '')}`;
  if (logRequests) {
    if (body) {
      console.log(
        `PUT ${baseUrl}/${url}/${queryParamsString}\n${JSON.stringify(body)}`,
      );
    } else {
      console.log(`PUT ${baseUrl}/${url}/${queryParamsString}}`);
    }
  }
  return fetch(`${baseUrl}/${url}/${queryParamsString}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }).then(res => validate(res));
}

export function deleteMethod(url: string, body: any, queryParams = [], headers = {}) {
  const reducer = (acc: any, param: any) => `${acc}&${param.key}=${param.value}`;
  const queryParamsString = `?${queryParams.reduce(reducer, '')}`;
  if (logRequests) {
    if (body) {
      console.log(
        `DELETE ${baseUrl}/${url}/${queryParamsString}\n${JSON.stringify(
          body,
        )}`,
      );
    } else {
      console.log(`DELETE ${baseUrl}/${url}/${queryParamsString}}`);
    }
  }
  return fetch(`${baseUrl}/${url}/${queryParamsString}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }).then(res => validate(res));
}
