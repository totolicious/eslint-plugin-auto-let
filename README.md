# eslint-plugin-auto-let

[![npm version](https://img.shields.io/npm/v/eslint-plugin-auto-let.svg)](https://www.npmjs.com/package/eslint-plugin-auto-let)

ESLint plugin that rewrites `const` to `let` when a const is reassigned within the same function or module.

Pairs well with [`prefer-const`](https://eslint.org/docs/latest/rules/prefer-const) and IDE lint-on-save:
`prefer-const` may rewrite `let` to `const` before you've finished writing reassignment logic; this rule undoes that when a write is present.

## Motivation & Warning

- You still want to use `prefer-const` where it matters
- You are inconvenienced by `let` being converted to `const` when saving your file immediately after the let declaration
- You are aware of the scenarios where this can go wrong (accidentally writing to a const in the same function)

## Behavior

The single rule `auto-let/convert-const-to-let` converts simple `const` declarations to `let` only when:

- The declaration is a single identifier (`const x = 1`, not destructuring or multi-declaration)
- At least one write reference exists (`x = ...`, `x += 1`, `x++`, etc.)
- Ignores `UPPERCASE_SNAKE_CASE` constants
- Only happens in the same function (ignores assignments that happen inside other functions (including nested functions))

### Example

Before saving:

```ts
function someFuction() {
  let count: number = 0; // this will be converted to const by prefer-const
}
```

After saving:

```ts
function someFuction() {
  const count: number = 0; // converted to const
}
```

Adding your assignment

```ts
function someFuction() {
  const count: number = 0;

  count++;
  console.log(count);
  // did not save yet, but after you save, the const count declaration will be converted to let
}
```

After saving

```ts
function someFuction() {
  let count: number = 0; // correctly converted const to let

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

## Eslint config

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

Enable fix-on-save in your editor (`source.fixAll.eslint`) so the rule runs alongside `prefer-const` while you write.

### Some examples (`const` → `let`)

Simple reassignment:

```ts
// before
const count = 0;
count++;

// after (eslint --fix)
let count = 0;
count++;
```

Assignment operators:

```ts
// before
const total = 10;
total += 5;

// after
let total = 10;
total += 5;
```

Assign in branches, then use later (common with `prefer-const` on save):

```ts
// before
function formatLabel(input?: string) {
  const label: string;
  if (input) {
    label = input;
  } else {
    label = "default";
  }
  label = label.toUpperCase();
}

// after
function formatLabel(input?: string) {
  let label: string;
  if (input) {
    label = input;
  } else {
    label = "default";
  }
  label = label.toUpperCase();
}
```

Reassignment inside a loop:

```ts
// before
const cursor = 0;
while (cursor < items.length) {
  cursor = next(cursor);
}

// after
let cursor = 0;
while (cursor < items.length) {
  cursor = next(cursor);
}
```

### Unchanged (left as-is)

No reassignment — binding never changes:

```ts
const name = "alice";
console.log(name);
```

Destructuring or multiple declarations — not simple `const x = …`:

```ts
const { x, y } = point;
const a = 1,
  b = 2;
```

Property mutation — the binding is unchanged, only the object contents:

```ts
const items: string[] = [];
items.push("a");
```

`UPPERCASE_SNAKE_CASE` — treated as a true constant:

```ts
const MAX_RETRIES = 3;
MAX_RETRIES = 5; // rule ignores this binding, prefer-const will keep this as a constant
```

Import bindings:

```ts
import fs from "node:fs";
fs = null; // rule ignores imports
```

Reassignment from a nested function — different scope, not auto-fixed:

```ts
function outer() {
  const value = 1;
  function inner() {
    value = 2; // this is ignored
  }
}
```

Already `let`:

```ts
let count = 0;
count++;
```

## Alternatives

- Always use `let`: [eslint-plugin-prefer-let](https://www.npmjs.com/package/eslint-plugin-prefer-let)

## License

MIT
