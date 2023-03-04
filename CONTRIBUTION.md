# Contribution Guidelines

Welcome to `react-intersection-observer`! I'm thrilled that you're interested in
contributing. Here are some guidelines to help you get started.

The codebase is written in TypeScript, and split into two packages using PNPM
workspaces:

- `react-intersection-observer` - The main package, which contains the
  `useInView` hook and the `InView` component.
- `storybook` - A Storybook project that is used to develop and test the
  `react-intersection-observer` package.

## Development

Start by forking the repository, and after cloning it locally you can install
the dependencies using PNPM:

```shell
pnpm install
```

Then you can start the Storybook development server with the `dev` task:

```shell
pnpm dev
```

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

- We use
  [semantic-release](https://github.com/semantic-release/semantic-release) to
  manage releases automatically. To ensure that releases are automatically
  versioned correctly, we follow the
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  Conventions. This means that your commit messages should have the following
  format:

`<type>: <subject>`

Here's what each part of the commit message means:

- `<type>`: The type of change that you're committing. Valid types include
  `feat` for new features, `fix` for bug fixes, `docs` for documentation
  changes, and `chore` for changes that don't affect the code itself (e.g.
  updating dependencies).
- `<subject>`: A short description of the change.

### Code Style

`react-intersection-observer` uses [Prettier](https://prettier.io/) for code
formatting. Please ensure that your changes are formatted with Prettier before
submitting your pull request.

### Testing

`react-intersection-observer` uses [Vitest](https://vitest.dev/) for testing.
Please ensure that your changes are covered by tests, and that all tests pass
before submitting your pull request.
