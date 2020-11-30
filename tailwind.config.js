module.exports = {
  purge: ['src/**/*.tsx'],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
    backgroundColor: [
      'responsive',
      'hover',
      'focus',
      'group-hover',
      'odd',
      'even',
    ],
    opacity: ['responsive', 'hover', 'focus', 'group-hover'],
    display: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [],
};
