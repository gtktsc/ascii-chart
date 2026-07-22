# Contributing

Thanks for considering a contribution to `simple-ascii-chart`.

## Getting Started

1. Fork the repository and create a branch for your change.
2. Install dependencies with `yarn install`.
3. Make your changes with focused commits.
4. Run the relevant checks before opening a pull request.

## Useful Commands

```bash
yarn lint
yarn test
yarn build
yarn check-exports
```

To regenerate example snapshots after output changes, run:

```bash
yarn snapshots:generate
```

## Pull Requests

- Keep pull requests focused on one change.
- Include tests or snapshot updates when behavior changes.
- Update documentation when options, usage, or requirements change.
- Describe what changed and how you verified it.

## Issues

When reporting a bug, please include:

- A small input example when possible.
- The expected output and the actual output.
- The Node.js version you used.
- Any relevant chart settings, renderer, or mode.
