module.exports = {
  presets: [
    [
      'env',
      process.env.BABEL_ENV === 'es'
        ? {
            targets: { node: '7' },
            modules: false,
          }
        : {},
    ],
    'react',
    'stage-2',
  ],
}
