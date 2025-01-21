module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "module-resolver",
        {
          alias: [
            {
              "@preact/signals-react": "@preact-signals/safe-react",
            },
          ],
        },
      ],
      "module:@preact-signals/safe-react/babel",
    ],
  };
};
