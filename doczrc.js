const path = require('path')

export default {
  title: 'React Intersection Observer',
  src: './docs',
  htmlContext: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href: 'https://codemirror.net/theme/dracula.css',
        },
      ],
    },
  },
  themeConfig: {
    mode: 'dark',
    codemirrorTheme: 'dracula',
    showPlaygroundEditor: false,
    colors: {
      primary: '#ad57ea',
    },
    styles: {
      body: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\n',
        background: '#13161F',
      },
      h2: {
        fontWeight: 200,
      },
      code: {
        background: '#493854',
      },
    },
  },
  typescript: true,
  modifyBundlerConfig: (config, dev, args) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'react-intersection-observer': path.resolve('./src/index.tsx'),
        },
      },
    }
  },
}
