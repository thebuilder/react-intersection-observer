import { copyFile, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(packageDirectory, "../..");

const metadata = ["README.md", "LICENSE"];
const action = process.argv[2];

if (action === "stage") {
  await Promise.all(
    metadata.map((file) =>
      copyFile(
        resolve(repositoryDirectory, file),
        resolve(packageDirectory, file),
      ),
    ),
  );
} else if (action === "clean") {
  await Promise.all(
    metadata.map((file) =>
      unlink(resolve(packageDirectory, file)).catch(() => {}),
    ),
  );
} else {
  throw new Error("Usage: node scripts/package-metadata.mjs stage|clean");
}
