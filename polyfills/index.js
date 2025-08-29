// Comprehensive polyfills for Node.js modules in React Native
// This file provides empty implementations for Node.js modules
// that might be required by libraries like Supabase

// Empty implementation that can be reused
const emptyModule = {
  connect: () => ({}),
  createServer: () => ({}),
  // Add other common methods
};

// Export all the polyfills
export default {
  net: emptyModule,
  tls: emptyModule,
  fs: emptyModule,
  path: emptyModule,
  crypto: require('crypto-browserify'),
  stream: require('stream-browserify'),
  http: require('stream-http'),
  https: require('stream-http'),
  zlib: emptyModule,
  util: emptyModule,
  // Use React Native's built-in WebSocket
  ws: global.WebSocket,
};
