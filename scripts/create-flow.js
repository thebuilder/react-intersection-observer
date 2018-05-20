const fs = require('fs')
const path = require('path')
const pkg = require('../package')

/**
 * Create a flow file that references the original source file, so Flow mapping is kept intact.
 * https://blog.kentcdodds.com/distributing-flow-type-definitions-for-node-and-browser-modules-3952ad38b357
 */
function createFlow() {
  fs.writeFileSync(
    path.join(process.cwd(), pkg.main + '.flow'),
    createFlowFile(),
    'utf-8',
  )
  fs.writeFileSync(
    path.join(process.cwd(), pkg.module + '.flow'),
    createFlowFile(),
    'utf-8',
  )
}

function createFlowFile(file = 'index.js') {
  return `// @flow
export * from '../src/${file}'
export { default } from '../src/${file}'
`
}

if (require.main === module) {
  createFlow()
}

module.exports = createFlow
