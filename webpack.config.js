const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // Ensure env has the mode set
  const mode = argv.mode || process.env.NODE_ENV || 'development';
  const expoEnv = {
    ...env,
    mode: mode,
  };
  
  const config = await createExpoWebpackConfigAsync(expoEnv, argv);
  
  // Add aliases for native modules that don't work on web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-vision-camera': path.resolve(__dirname, 'mocks/react-native-vision-camera.web.js'),
    'react-native-vector-icons/MaterialCommunityIcons': path.resolve(__dirname, 'mocks/react-native-vector-icons.web.js'),
    'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'mocks/react-native-vector-icons.web.js'),
    // Fix nanoid/non-secure import issue for React Navigation on web
    'nanoid/non-secure': path.resolve(__dirname, 'mocks/nanoid-non-secure.js'),
  };
  
  // Fix devServer config for newer webpack-dev-server versions
  if (config.devServer) {
    const { https, ...restDevServer } = config.devServer;
    config.devServer = {
      ...restDevServer,
      // Use 'server' instead of 'https' for webpack-dev-server v4+
      server: https ? 'https' : 'http',
      port: 19006,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      historyApiFallback: true,
    };
  }
  
  return config;
};

