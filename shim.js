// React Native polyfills for Node.js modules
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Make Buffer available globally
global.Buffer = Buffer;

// Empty implementations for Node.js modules
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.browser = true;

// Empty implementations for problematic modules
global.net = {
  connect: () => ({}),
  createServer: () => ({}),
};

global.tls = {
  connect: () => ({}),
  createServer: () => ({}),
};

// Other potential modules that might be needed
global.fs = {};
global.path = {};
global.zlib = {};
global.util = {};
