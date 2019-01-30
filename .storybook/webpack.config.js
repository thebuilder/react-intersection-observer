// webpack.config.js
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.entry = defaultConfig.entry.map(path => {
    if (path.includes('webpack-hot-middleware')) {
      return path + '&overlay=false'
    }
    return path
  })

  defaultConfig.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  })
  defaultConfig.resolve.extensions.push('.ts', '.tsx')

  defaultConfig.plugins.push(new ErrorOverlayPlugin())

  return defaultConfig
}
