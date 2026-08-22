# Contribution guidelines

Thanks for wanting to contribute to `react-intersection-observer`. Here's what
you need to know to get started.

The codebase is written in TypeScript and uses PNPM workspaces:

- `packages/react-intersection-observer` - The published package, which contains
  the `useInView` hook and the `InView` component.
- `apps/storybook` - The Storybook project used to develop and test the package.
- `apps/docs` - The Blume documentation site.

## Development

Fork the repository, clone it locally, and install the dependencies with
[PNPM](https://pnpm.io/):

```shell
pnpm install
```

Then start both apps with the `dev` task:

```shell
pnpm dev
```

Use `pnpm dev:storybook` or `pnpm dev:docs` to start one at a time.

## Semantic versioning

`react-intersection-observer` follows Semantic Versioning 2.0 as defined at
http://semver.org. This means that releases will be numbered with the following
format:

`<major>.<minor>.<patch>`

- Breaking changes and new features will increment the major version.
- Backwards-compatible enhancements will increment the minor version.
- Bug fixes and documentation changes will increment the patch version.

## Pull requests

Create a branch on your fork for the fix or feature, then:

- Add tests for the change.
- Make sure all tests pass.
- Update `README.md` if the change affects it.
- Follow the commit conventions below.

### Commit message conventions

Commits follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), so the
generated release notes stay readable:

`<type>: <subject>`

- `<type>` is the kind of change. Use `feat` for new features, `fix` for bug
  fixes, `docs` for documentation, and `chore` for everything that doesn't touch
  the code itself, such as dependency updates.
- `<subject>` is a short description of the change.

### Code style and linting

`react-intersection-observer` uses [Biome](https://biomejs.dev/) for formatting
and linting. Format your changes with Biome before opening a pull request.

### Testing

`react-intersection-observer` uses [Vitest](https://vitest.dev/) for testing.
Cover your changes with tests, and make sure the whole suite passes before
opening a pull request.

Run the package tests with the `test` task. Component tests run in Vitest
Browser Mode with Playwright, and SSR tests run in a separate Node project.

```shell
pnpm test
```

Build the package and both apps with:

```shell
pnpm build:all
```

## Releasing

Releases are published from CI with
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm
token exists anywhere and packages are published with provenance. There is no
local publish step, and `npm publish` from a laptop will be rejected.

To cut a release, a maintainer opens the **Actions** tab, selects the
**Release** workflow and runs it from the branch to release:

- `version` picks the bump (`patch`, `minor`, `major` or a `pre*` variant).
- `tag` picks the npm dist-tag, `latest` by default. Use `beta` for prereleases.

The workflow bumps the version, commits and tags it, builds the package,
publishes it to npm, and creates a GitHub release with generated notes.

`main` is protected, so the version commit is pushed with a short-lived token
minted from a GitHub App listed as a bypass actor on the branch ruleset. The
app's id lives in the `RELEASE_APP_ID` variable, and its private key in the
`RELEASE_APP_KEY` secret.
