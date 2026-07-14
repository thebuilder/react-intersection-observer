import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { JSDOM, VirtualConsole } from "jsdom";

const exec = promisify(execFile);
const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const fixtureRoot = join(repositoryRoot, "fixtures/react-compat");
const versions = {
  17: "17.0.2",
  18: "18.3.1",
  19: "19.2.3",
};
const major = process.argv.slice(2).find((argument) => argument !== "--");

if (!(major in versions)) {
  throw new Error("Usage: pnpm run compat:packed -- 17|18|19");
}

const temporaryRoot = await mkdtemp(join(tmpdir(), `rio-react-${major}-`));

try {
  const packageDirectory = join(temporaryRoot, "package");
  const packDirectory = join(temporaryRoot, "pack");
  await cp(fixtureRoot, packageDirectory, { recursive: true });
  await mkdir(packDirectory);

  const { stdout } = await exec(
    "corepack",
    ["pnpm", "pack", "--pack-destination", packDirectory],
    { cwd: repositoryRoot },
  );
  const tarballName = stdout.trim().split("\n").at(-1);
  const tarballPath = join(packDirectory, basename(tarballName));

  await writeFile(
    join(packageDirectory, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        scripts: { build: "rsbuild build" },
        dependencies: {
          "@rsbuild/core": "1.5.13",
          "@rsbuild/plugin-react": "1.4.2",
          jsdom: "27.0.1",
          react: versions[major],
          "react-dom": versions[major],
          "react-intersection-observer": `file:${tarballPath}`,
        },
      },
      null,
      2,
    )}\n`,
  );

  await exec("corepack", ["pnpm", "install"], { cwd: packageDirectory });
  await exec("corepack", ["pnpm", "build"], {
    cwd: packageDirectory,
    env: { ...process.env, REACT_MAJOR: major },
  });

  const scripts = (
    await readdir(join(packageDirectory, "dist", "static", "js"))
  ).filter((file) => file.endsWith(".js"));
  assert.equal(scripts.length, 1, "expected one built client bundle");
  const bundle = await readFile(
    join(packageDirectory, "dist", "static", "js", scripts[0]),
    "utf8",
  );
  const jsdomErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => jsdomErrors.push(error));
  const dom = new JSDOM('<div id="root"></div>', {
    runScripts: "dangerously",
    url: "http://localhost/",
    virtualConsole,
  });
  dom.window.eval(bundle);

  for (
    let attempt = 0;
    attempt < 100 && !dom.window.__COMPAT_RESULT__;
    attempt++
  ) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  assert.deepEqual(jsdomErrors, []);
  const result = dom.window.__COMPAT_RESULT__;
  assert.ok(result, "smoke test did not finish");
  assert.equal(result.diagnostics.length, 0, result.diagnostics.join("\n"));
  assert.equal(result.observeCount, 4);
  assert.equal(result.unobserveCount, 4);
  dom.window.close();

  console.log(`React ${major} packed compatibility passed`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
