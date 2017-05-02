/**
 * Ensure that the window and document object exists on global.
 * Otherwise the intersection-observer will just crash when rendering serverside.
 */
function ensureWindow() {
  if (!global.window) {
    global.window = {}
  }

  if (!global.document) {
    global.document = {}
  }
}

export default ensureWindow()
