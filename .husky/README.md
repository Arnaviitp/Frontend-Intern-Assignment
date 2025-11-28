# Husky Pre-commit Hook Configuration

This directory would contain Git hooks for running linters and tests before commits.

To set up Husky in the future:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Then add to package.json:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```
