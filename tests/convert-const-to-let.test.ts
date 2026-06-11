import { RuleTester } from "@typescript-eslint/rule-tester";
import tsParser from "@typescript-eslint/parser";
import { describe, it, afterAll } from "vitest";
import rule from "../src/rules/convert-const-to-let.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

ruleTester.run("convert-const-to-let", rule, {
  valid: [
    // no mutation
    "const x = 1;",
    // destructuring
    "const { a } = obj;",
    // array destructuring
    "const [x] = arr;",
    // multiple declarations
    "const a = 1, b = 2;",
    // property mutation only
    "const obj = { x: 1 }; obj.x = 2;",
    // uppercase constant
    {
      code: "const MAX = 1; MAX = 2;",
    },
    // import binding
    {
      code: "import x from 'mod'; x = 2;",
    },
    // mutation in different scope
    {
      code: `
        function foo() {
          const x = 1;
          function bar() {
            x = 2;
          }
        }
      `,
    },
    // let already
    "let x = 1; x = 2;",
  ],

  invalid: [
    {
      code: "const x = 1; x = 2;",
      output: "let x = 1; x = 2;",
      errors: [{ messageId: "convert" }],
    },
    {
      code: "const x = 1; x += 1;",
      output: "let x = 1; x += 1;",
      errors: [{ messageId: "convert" }],
    },
    {
      code: "const x = 1; x++;",
      output: "let x = 1; x++;",
      errors: [{ messageId: "convert" }],
    },
    {
      code: "const x = 1; --x;",
      output: "let x = 1; --x;",
      errors: [{ messageId: "convert" }],
    },
    {
      code: `
        function foo() {
          const x = 1;
          x = 2;
        }
      `,
      output: `
        function foo() {
          let x = 1;
          x = 2;
        }
      `,
      errors: [{ messageId: "convert" }],
    },
    {
      code: `
        {
          const x = 1;
          x = 2;
        }
      `,
      output: `
        {
          let x = 1;
          x = 2;
        }
      `,
      errors: [{ messageId: "convert" }],
    },
    {
      code: `
        const newPwd: string;
        if (!args[0]) {
          newPwd = process.env.HOME;
        } else {
          newPwd = args[0];
        }
        newPwd = resolve(newPwd);
      `,
      output: `
        let newPwd: string;
        if (!args[0]) {
          newPwd = process.env.HOME;
        } else {
          newPwd = args[0];
        }
        newPwd = resolve(newPwd);
      `,
      errors: [{ messageId: "convert" }],
    },
  ],
});
