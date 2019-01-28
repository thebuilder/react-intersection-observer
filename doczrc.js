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
    colors: {
      primary: '#ad57ea',
    },
    styles: {
      html: { background: '#13161F' },
      body: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\n',
      },
      h1: {
        fontSize: '4em',
        fontWeight: 700,
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
