const fs = require('fs');
const path = require('path');
const pck = require('../package');
const rootDir = path.resolve(__dirname, '../');
const distDir = path.resolve(__dirname, '../dist');

const filesToCopy = ['package.json', 'README.md', 'LICENSE'];
filesToCopy.forEach((file) => {
  fs.copyFileSync(path.resolve(rootDir, file), path.resolve(distDir, file));
});

const packageFieldsToRemove = [
  'private',
  'devDependencies',
  'optionalDependencies',
  'lint-staged',
  'scripts',
  'husky',
  'simple-git-hooks',
  'prettier',
  'jest',
  'eslintConfig',
  'eslintIgnore',
  'np',
];

packageFieldsToRemove.forEach((field) => {
  delete pck[field];
});

// Remove 'dist' from the files inside the 'dist' dir, after we move them
const fields = ['main', 'module', 'unpkg', 'esmodule', 'exports', 'typings'];
fields.forEach((key) => (pck[key] = pck[key]?.replace('dist/', '')));

fs.writeFileSync(
  path.resolve(distDir, 'package.json'),
  JSON.stringify(pck, undefined, 2),
  'utf-8',
);
