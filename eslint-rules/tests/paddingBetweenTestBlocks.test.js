import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";
import tseslint from "typescript-eslint";
import rule from "../paddingBetweenTestBlocks.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

ruleTester.run("padding-between-test-blocks", rule, {
  valid: [
    `test("a", () => {});

test("b", () => {});`,
    `describe("group", () => {
  it("a", () => {});

  it.each([1, 2])("b %i", () => {});

  describe("nested", () => {});
});`,
    `test("a", () => {});

// a comment about b
test("b", () => {});`,
    `test("a", () => {});
// a comment about b

test("b", () => {});`,
    // Only test and describe blocks need the gap; hooks and assertions do not.
    `beforeEach(() => {});
it("a", () => {
  expect(1).toBe(1);
  expect(2).toBe(2);
});`,
    `const a = 1;
describe("x", () => {});`,
  ],
  invalid: [
    {
      code: `test("a", () => {});
test("b", () => {});`,
      output: `test("a", () => {});

test("b", () => {});`,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: `describe("group", () => {
  it("a", () => {});
  it.each([1, 2])("b %i", () => {});
});
describe("other", () => {});`,
      output: `describe("group", () => {
  it("a", () => {});

  it.each([1, 2])("b %i", () => {});
});

describe("other", () => {});`,
      errors: [{ messageId: "missingBlankLine" }, { messageId: "missingBlankLine" }],
    },
    {
      code: `test.describe("page", () => {
  test("a", async () => {});
  test.skip("b", async () => {});
});`,
      output: `test.describe("page", () => {
  test("a", async () => {});

  test.skip("b", async () => {});
});`,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: `test("a", () => {});
// a comment about b
test("b", () => {});`,
      output: `test("a", () => {});

// a comment about b
test("b", () => {});`,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: `test("a", () => {}); // note on a
test("b", () => {});`,
      output: `test("a", () => {}); // note on a

test("b", () => {});`,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: `test("a", () => {}); test("b", () => {});`,
      output: `test("a", () => {});
 test("b", () => {});`,
      errors: [{ messageId: "missingBlankLine" }],
    },
  ],
});
