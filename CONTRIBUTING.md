# Contribution Guidelines

Welcome to `react-intersection-observer`! I'm thrilled that you're interested in
contributing. Here are some guidelines to help you get started.

The codebase is written in TypeScript and uses PNPM workspaces:

- `packages/react-intersection-observer` - The published package, which contains
  the `useInView` hook and the `InView` component.
- `apps/storybook` - The Storybook project used to develop and test the package.
- `apps/docs` - The Blume documentation site.

## Development

Start by forking the repository, and after cloning it locally you can install
the dependencies using [PNPM](https://pnpm.io/):

```shell
pnpm install
```

Then you can start the development surfaces with the `dev` task:

```shell
pnpm dev
```

Use `pnpm dev:storybook` or `pnpm dev:docs` to start one surface at a time.

## Semantic Versioning

`react-intersection-observer` follows Semantic Versioning 2.0 as defined at
http://semver.org. This means that releases will be numbered with the following
format:

`<major>.<minor>.<patch>`

- Breaking changes and new features will increment the major version.
- Backwards-compatible enhancements will increment the minor version.
- Bug fixes and documentation changes will increment the patch version.

## Pull Request Process

Fork the repository and create a branch for your feature/bug fix.

- Add tests for your feature/bug fix.
- Ensure that all tests pass before submitting your pull request.
- Update the README.md file if necessary.
- Ensure that your commits follow the conventions outlined in the next section.

### Commit Message Conventions

- We follow the
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  Conventions, so the generated release notes stay readable. This means that
  your commit messages should have the following format:

`<type>: <subject>`

Here's what each part of the commit message means:

- `<type>`: The type of change that you're committing. Valid types include
  `feat` for new features, `fix` for bug fixes, `docs` for documentation
  changes, and `chore` for changes that don't affect the code itself (e.g.
  updating dependencies).
- `<subject>`: A short description of the change.

### Code Style and Linting

`react-intersection-observer` uses [Biome](https://biomejs.dev/) for code
formatting and linting. Please ensure that your changes are formatted with Biome before
submitting your pull request.

### Testing

`react-intersection-observer` uses [Vitest](https://vitest.dev/) for testing.
Please ensure that your changes are covered by tests, and that all tests pass
before submitting your pull request.

You can run the package tests with the `test` task. Component tests run in
Vitest Browser Mode with Playwright; SSR tests run in a separate Node project.

```shell
pnpm test
```

Build every published and documentation surface with:

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
