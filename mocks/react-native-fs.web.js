// Mock for react-native-fs on web
export const DocumentDirectoryPath = '/';
export const CachesDirectoryPath = '/';
export const TemporaryDirectoryPath = '/';
export const writeFile = () => Promise.resolve();
export const readFile = () => Promise.resolve('');
export const unlink = () => Promise.resolve();
export const exists = () => Promise.resolve(false);
export const mkdir = () => Promise.resolve();
export const downloadFile = () => ({ promise: Promise.resolve({ statusCode: 200 }) });

export default {
  DocumentDirectoryPath,
  CachesDirectoryPath,
  TemporaryDirectoryPath,
  writeFile,
  readFile,
  unlink,
  exists,
  mkdir,
  downloadFile,
};
