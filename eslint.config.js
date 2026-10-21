const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "src/data/**", "src/vendor/**", "temp/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Require strict equality, except for null/undefined checks.
      eqeqeq: ["error", "always", { null: "ignore" }],
      // Allow intentionally unused args/vars and empty catch blocks.
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      // Polling and retry loops are intentional.
      "no-constant-condition": ["error", { checkLoops: false }],
    },
  },
];
