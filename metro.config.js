const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const webMocks = {
  'react-native-vision-camera': path.resolve(__dirname, 'mocks/react-native-vision-camera.web.js'),
  'react-native-fs': path.resolve(__dirname, 'mocks/react-native-fs.web.js'),
  '@react-native-camera-roll/camera-roll': path.resolve(__dirname, 'mocks/camera-roll.web.js'),
  '@react-native-community/datetimepicker': path.resolve(__dirname, 'mocks/datetimepicker.web.js'),
  'react-native-progress': path.resolve(__dirname, 'mocks/react-native-progress.web.js'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webMocks[moduleName]) {
    return { filePath: webMocks[moduleName], type: 'sourceFile' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
