// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import nextPlugin from "@next/eslint-plugin-next";

import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [// Ignore build output and other generated files
{
  ignores: [
    ".next/**",
    "**/node_modules/**",
    "out/**",
    "dist/**",
    "scripts/run-database-fixes.js",
    "snippets/**",
    "__tests__/**",
    "agents/**",
    "instructions/**",
    "**/[id]/**",
    "public/workbox-*.js",
    "public/sw.js",
  ],
}, {
  plugins: {
    "@next/next": nextPlugin,
  },
}, {
  files: ["scripts/**/*.js"],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "script",
  },
  rules: {
    "no-console": "off",
  },
}, {
  files: ["**/*.{js,jsx}"],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    // React rules - off for Next.js 13+ (automatic JSX transform)
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    // Variable usage - off to allow common patterns
    "no-unused-vars": "off",

    // Console statements - off for debugging
    "no-console": "off",
  },
}, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      projectService: true,
    },
  },
  plugins: {
    "@typescript-eslint": typescriptEslint,
    "@next/next": nextPlugin,
  },
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-interface": "off",
    // Next.js core web vitals
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  },
}, ...storybook.configs["flat/recommended"]];
