module.exports = {
  expo: {
    name: "v7",
    slug: "v7",
    // Add other existing configuration here
    
    // Add this section to resolve the WebSocket issue
    web: {
      bundler: "metro",
    },
    // This is important for handling Node.js modules in React Native
    packagerOpts: {
      sourceExts: ["js", "jsx", "ts", "tsx", "json", "cjs", "mjs"],
      config: "metro.config.js",
    },
  },
};
