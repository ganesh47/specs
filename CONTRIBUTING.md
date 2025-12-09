# Contributing to specs

Thanks for helping build specs! This project is meant to stay lightweight and user-owned.

## Branching and workflow
- Fork or create a feature branch from `main`.
- Keep changes focused; prefer small, reviewable PRs.
- Add or update docs for new behavior.
- Run lint/build/test scripts relevant to your changes.

## Coding style
- TypeScript for source files.
- Keep the CLI modular: commands delegate to `src/core` helpers.
- Prefer clarity over cleverness; add brief comments when code is non-obvious.

## Commits and PRs
- Write descriptive commit messages.
- Reference related specs/issues where possible.
- Use GitHub CLI (`gh`) for project automation if needed.
