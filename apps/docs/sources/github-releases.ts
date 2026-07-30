import { resolve } from "node:path";

import type { ContentSource, SourceEntry } from "blume/core/sources/types.ts";
import { githubReleasesSource } from "blume/sources/github-releases.ts";

type ReleaseSourceOptions = {
  owner: string;
  repo: string;
};

const excludeSearchFromRaw = (raw: string): string =>
  raw.replace(/^---\n/u, "---\nsearch:\n  exclude: true\n");

const excludeFromSearch = (entry: SourceEntry): SourceEntry => ({
  ...entry,
  data: {
    ...entry.data,
    search: { exclude: true },
  },
  raw: entry.raw ? excludeSearchFromRaw(entry.raw) : undefined,
});

export const githubReleaseChangelogSource = ({
  owner,
  repo,
}: ReleaseSourceOptions): ContentSource => {
  const isDev = process.argv.includes("dev");
  const source = githubReleasesSource(
    {
      name: "changelog",
      owner,
      prefix: "changelog",
      repo,
    },
    {
      cacheDir: resolve(".blume/cache/changelog"),
      mode: isDev ? "dev" : "build",
      projectRoot: process.cwd(),
      refresh: !isDev,
    },
  );

  return {
    ...source,
    load: async () => {
      const result = await source.load();

      return {
        ...result,
        entries: result.entries.map(excludeFromSearch),
      };
    },
    read: source.read
      ? async (ref) => excludeSearchFromRaw(await source.read(ref))
      : undefined,
  };
};
