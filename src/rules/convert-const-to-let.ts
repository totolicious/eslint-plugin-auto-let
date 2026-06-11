import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator(
  () => "https://github.com/totolicious/eslint-plugin-auto-let/blob/main/README.md"
)({
  name: "convert-const-to-let",

  meta: {
    type: "suggestion",
    docs: {
      description: "Convert const to let when mutation is proven via scope analysis",
    },
    fixable: "code",
    schema: [],
    messages: {
      convert: "convert const to let",
    },
  },

  defaultOptions: [],

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      VariableDeclaration(node: TSESTree.VariableDeclaration) {
        if (node.kind !== "const") return;
        if (node.declarations.length !== 1) return;

        const decl = node.declarations[0];
        if (decl.id.type !== "Identifier") return;

        const name = decl.id.name;

        const scope = sourceCode.getScope(node);
        const variable = scope.set.get(name);

        if (!variable) return;

        if (variable.defs.some((d) => d.type === "ImportBinding")) return;

        if (/^[A-Z0-9_]+$/.test(name)) return;

        const writes = variable.references.filter(
          (ref) => ref.isWrite() && ref.identifier !== decl.id
        );
        if (writes.length === 0) return;

        const declVariableScope = variable.scope.variableScope;
        const safe = writes.every(
          (w) => w.from.variableScope === declVariableScope
        );

        if (!safe) return;

        context.report({
          node,
          messageId: "convert",
          fix(fixer) {
            const token = sourceCode.getFirstToken(node)!;
            return fixer.replaceText(token, "let");
          },
        });
      },
    };
  },
});
