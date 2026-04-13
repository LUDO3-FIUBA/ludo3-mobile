import lodash from 'lodash';

function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function convertSnakeToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => convertSnakeToCamelCase(item));
  }

  if (!isObject(obj)) {
    return obj;
  }

  return Object.keys(obj).reduce((acc: any, key: any) => {
    const camelKey = lodash.camelCase(key);
    let value = obj[key];

    // Apply conversion recursively if the value is an object or an array
    if (isObject(value) || Array.isArray(value)) {
      value = convertSnakeToCamelCase(value);
    }

    acc[camelKey] = value;
    return acc;
  }, {});
}
