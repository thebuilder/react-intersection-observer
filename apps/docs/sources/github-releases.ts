import { resolve } from "node:path";

import { githubReleasesSource } from "blume/core/sources/github-releases.ts";
import type { ContentSource, SourceEntry } from "blume/sources";

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

/**
 * Wrap a release source so its pages stay out of the search index.
 *
 * `withContext` has to re-wrap rather than pass through: Blume rebuilds a
 * `custom()` source on the scan's own cache dir and refresh policy by calling
 * it, so a wrapper that inherited the underlying implementation would hand
 * back a bare source and silently drop the exclusion.
 */
const withSearchExcluded = (source: ContentSource): ContentSource => ({
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
  withContext: (next) =>
    withSearchExcluded(source.withContext ? source.withContext(next) : source),
});

export const githubReleaseChangelogSource = ({
  owner,
  repo,
}: ReleaseSourceOptions): ContentSource => {
  const isDev = process.argv.includes("dev");

  return withSearchExcluded(
    githubReleasesSource(
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
    ),
  );
};
