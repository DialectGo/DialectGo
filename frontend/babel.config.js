module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // NativeWind MUST be here as a preset
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
      '@babel/plugin-proposal-optional-chaining',
      'react-native-reanimated/plugin', // Keep this last
    ],
  };
};