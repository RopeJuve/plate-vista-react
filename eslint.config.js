import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import paddingBetweenTestBlocks from "./eslint-rules/paddingBetweenTestBlocks.js";

export default [
  // .claude/ holds vendored agent-skill scripts (UMD bundles), not app code.
  { ignores: ["dist/**", "node_modules/**", ".claude/**"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": ["error", { varsIgnorePattern: "^React$", argsIgnorePattern: "^_" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^React$", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "buttonVariants",
            "useFormField",
            "useAuth",
            "useCart",
            "useStateContext",
            "useOrder",
            "useRealtime",
            "useGuestAuth",
            "useGuestBill",
            "useMenu",
            "useStaffBoard",
          ],
        },
      ],
    },
  },
  {
    // Unit/component tests and Playwright specs: a blank line between consecutive test and describe blocks.
    files: ["src/**/*.test.{ts,tsx}", "e2e/**/*.spec.ts", "eslint-rules/**/*.test.js"],
    plugins: {
      "test-blocks": { rules: { "padding-between-test-blocks": paddingBetweenTestBlocks } },
    },
    rules: {
      "test-blocks/padding-between-test-blocks": "error",
    },
  },
  {
    files: ["*.config.js", "tailwind.config.js", "vite.config.ts", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
