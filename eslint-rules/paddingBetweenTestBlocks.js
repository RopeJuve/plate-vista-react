// Requires a blank line between consecutive test and describe blocks
// (`test`, `it`, `describe`, including chains like `it.each([...])(...)` and `test.describe.serial(...)`).
// Core `padding-line-between-statements` cannot tell a test block from any other call statement.

const BLOCK_NAMES = new Set(["describe", "it", "test"]);

function rootName(node) {
  let current = node;
  while (current) {
    if (current.type === "Identifier") return current.name;
    if (current.type === "CallExpression") current = current.callee;
    else if (current.type === "MemberExpression") current = current.object;
    else if (current.type === "TaggedTemplateExpression") current = current.tag;
    else return null;
  }
  return null;
}

function isComment(token) {
  return token.type === "Line" || token.type === "Block";
}

function isTestBlock(statement) {
  return (
    statement?.type === "ExpressionStatement" &&
    statement.expression.type === "CallExpression" &&
    BLOCK_NAMES.has(rootName(statement.expression.callee))
  );
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "layout",
    docs: { description: "Require a blank line between consecutive test and describe blocks" },
    fixable: "whitespace",
    schema: [],
    messages: { missingBlankLine: "Expected a blank line before this test or describe block." },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function hasBlankLineBetween(prev, next) {
      // Walk every token and comment between the two statements; a gap of 2+ lines is a blank line.
      let left = sourceCode.getLastToken(prev);
      for (;;) {
        const right = sourceCode.getTokenAfter(left, { includeComments: true });
        if (right.loc.start.line - left.loc.end.line >= 2) return true;
        if (right === sourceCode.getFirstToken(next)) return false;
        left = right;
      }
    }

    // The last token or comment on the line where `statement` ends, so a trailing comment stays put.
    function endOfLine(statement) {
      let last = sourceCode.getLastToken(statement);
      let after = sourceCode.getTokenAfter(last, { includeComments: true });
      while (after && isComment(after) && after.loc.start.line === last.loc.end.line) {
        last = after;
        after = sourceCode.getTokenAfter(last, { includeComments: true });
      }
      return last;
    }

    function checkBody(statements) {
      for (let i = 1; i < statements.length; i += 1) {
        const prev = statements[i - 1];
        const next = statements[i];
        if (!isTestBlock(prev) || !isTestBlock(next) || hasBlankLineBetween(prev, next)) continue;
        context.report({
          node: next,
          messageId: "missingBlankLine",
          fix: (fixer) => fixer.insertTextAfter(endOfLine(prev), "\n"),
        });
      }
    }

    return {
      Program: (node) => checkBody(node.body),
      BlockStatement: (node) => checkBody(node.body),
    };
  },
};
