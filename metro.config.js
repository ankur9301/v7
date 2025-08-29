const { getDefaultConfig } = require('@expo/metro-config');
const nodeLibs = require('node-libs-react-native');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Import our custom polyfills
const customPolyfills = {
  net: path.resolve(__dirname, 'polyfills/net.js'),
  tls: path.resolve(__dirname, 'polyfills/tls.js'),
  ws: path.resolve(__dirname, 'polyfills/ws.js'),
};

// Polyfill Node core modules using node-libs-react-native and our custom polyfills
config.resolver.extraNodeModules = {
  ...nodeLibs,
  ...customPolyfills,
  ...config.resolver.extraNodeModules,
};

// Support additional extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

// Prioritize browser field for package.json module resolution to pick browser-safe bundles
config.resolver.mainFields = ['react-native', 'browser', 'main'];

module.exports = config;
