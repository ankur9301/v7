module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      'babel-plugin-transform-import-meta',
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
      }]
    ],
  };
};


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
//     plugins: [
//       'babel-plugin-transform-import-meta', // <-- Add this
//     ],
//   };
// };


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: ['react-native-reanimated/plugin'],
//   };
// };

// // babel.config.js
// module.exports = {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       [
//         "module:react-native-dotenv",
//         {
//           moduleName: "@env",
//           path: ".env",
//           safe: false,
//           allowUndefined: true,
//         },
//       ],
//     ],
//   };
//   å