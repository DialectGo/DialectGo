module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './assets',
          },
        },
      ],
      '@babel/plugin-proposal-optional-chaining', // Add this here
      'react-native-reanimated/plugin',
    ],
  };
};