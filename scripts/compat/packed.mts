import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

type RepositoryPackage = {
  packageManager: string;
  devDependencies: Record<string, string>;
};

const exec = promisify(execFile);
const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const fixtureRoot = join(repositoryRoot, "fixtures/react-compat");
const repositoryPackage = JSON.parse(
  await readFile(join(repositoryRoot, "package.json"), "utf8"),
) as RepositoryPackage;
const versions = {
  "17": "17.0.2",
  "18": "18.3.1",
  "19": "19.2.3",
} as const;

type ReactMajor = keyof typeof versions;

function isReactMajor(value: string | undefined): value is ReactMajor {
  return value !== undefined && value in versions;
}

const major = process.argv.slice(2).find((argument) => argument !== "--");

if (!isReactMajor(major)) {
  throw new Error("Usage: pnpm run compat:packed -- 17|18|19");
}

const temporaryRoot = await mkdtemp(join(tmpdir(), `rio-react-${major}-`));

try {
  const packageDirectory = join(temporaryRoot, "package");
  const packDirectory = join(temporaryRoot, "pack");
  await cp(fixtureRoot, packageDirectory, { recursive: true });
  await mkdir(packDirectory);

  const { stdout } = await exec(
    "pnpm",
    ["pack", "--pack-destination", packDirectory],
    { cwd: repositoryRoot },
  );
  const tarballName = stdout.trim().split("\n").at(-1);

  if (!tarballName) {
    throw new Error("pnpm pack did not return a tarball path");
  }

  const tarballPath = join(packDirectory, basename(tarballName));

  await writeFile(
    join(packageDirectory, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        packageManager: repositoryPackage.packageManager,
        scripts: { build: "rsbuild build" },
        dependencies: {
          "@rsbuild/core": repositoryPackage.devDependencies["@rsbuild/core"],
          "@rsbuild/plugin-react":
            repositoryPackage.devDependencies["@rsbuild/plugin-react"],
          react: versions[major],
          "react-dom": versions[major],
          "react-intersection-observer": `file:${tarballPath}`,
        },
      },
      null,
      2,
    )}\n`,
  );

  await exec("pnpm", ["install"], { cwd: packageDirectory });
  await exec("pnpm", ["build"], { cwd: packageDirectory });

  console.log(`React ${major} packed build passed`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
