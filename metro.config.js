const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

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
  // On native, Expo CLI aliases `react-native-vector-icons` -> `@expo/vector-icons`,
  // whose runtime Font.loadAsync registration doesn't apply on Android in this setup
  // (icons render blank). Bypass the alias on native so the real package is used, which
  // renders with the fonts embedded natively via the expo-font plugin in app.json.
  if (platform !== 'web') {
    const m = moduleName.match(/^react-native-vector-icons\/(.+)$/);
    if (m) {
      const real = path.resolve(__dirname, 'node_modules/react-native-vector-icons', `${m[1]}.js`);
      if (fs.existsSync(real)) {
        return { filePath: real, type: 'sourceFile' };
      }
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
