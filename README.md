# eslint-plugin-auto-let

[![npm version](https://img.shields.io/npm/v/eslint-plugin-auto-let.svg)](https://www.npmjs.com/package/eslint-plugin-auto-let)

ESLint plugin that converts `const` to `let` when constant assignment happens in the same function scope.

Pairs well with [`prefer-const`](https://eslint.org/docs/latest/rules/prefer-const) and IDE lint-on-save:
`prefer-const` will rewrite a `let` to `const` before you've finished writing reassignment logic if you lint with autofix on save

## Motivation & Warning

- You still want to use `prefer-const` where it matters
- You are inconvenienced by `let` being converted to `const` while writing
- You are aware of the scenarios where this can go wrong (accidentally writing to a const in the same function)

## Behavior

The single rule `auto-let/convert-const-to-let` converts simple `const` declarations to `let` only when:

- The declaration is a single identifier (`const x = 1`, not destructuring or multi-declaration)
- The binding is local (not an import)
- At least one write reference exists (`x = ...`, `x += 1`, `x++`, etc.)
- Ignores `UPPERCASE_SNAKE_CASE` constants
- Ignores assignments that happen inside other functions (including nested functions)

### Example

Before:

```ts
function someFuction() {
  const count: number = 0; // prefer-const auto-fixed let to const on save

  // assignment happening after save
  count++;
  console.log(count);
}
```

After:

```ts
function someFuction() {
  let count: number = 0;

  count++;
  console.log(count);
}
```

## Installation

```bash
npm install -D eslint-plugin-auto-let @typescript-eslint/parser
```

**Requirements**

- Node.js >= 18.18
- ESLint >= 8.57
- `@typescript-eslint/parser` ^8 (TypeScript only)

## Usage

```js
// eslint.config.js
import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import autoLet from "eslint-plugin-auto-let";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "auto-let": autoLet,
    },
    rules: {
      "auto-let/convert-const-to-let": "error",
    },
  },
];
```

## Alternatives

- Always use `let`: (eslint-plugin-prefer-let)[https://www.npmjs.com/package/eslint-plugin-prefer-let]

## License

MIT
