module.exports = {
  presets: [
    [
      'env',
      process.env.BABEL_ENV === 'es'
        ? {
            modules: false,
          }
        : {},
    ],
    'react',
    'stage-2',
  ],
}
