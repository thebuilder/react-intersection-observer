import ReactDOM from "react-dom";
import { CompatibilityFixture, result, settle } from "./scenario";

const container = document.getElementById("root");

async function run() {
  ReactDOM.render(<CompatibilityFixture attached />, container);
  await settle();
  ReactDOM.render(<CompatibilityFixture attached={false} />, container);
  await settle();
  ReactDOM.render(<CompatibilityFixture attached />, container);
  await settle();
  ReactDOM.unmountComponentAtNode(container);
  await settle();

  window.__COMPAT_RESULT__ = result();
}

run();
