// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import reactHooks from "eslint-plugin-react-hooks";
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
    "react-hooks": reactHooks,
  },
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-interface": "off",

    // Next.js core web vitals
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
    ...reactHooks.configs.recommended.rules,
    // React hooks overrides — placed AFTER recommended to downgrade strict rules
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/refs": "warn",
    "react-hooks/static-components": "warn",
    "react-hooks/use-memo": "warn",
    "react-hooks/preserve-manual-memoization": "warn",
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/no-render-return-value": "off",
    "react-hooks/component-hook-factories": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/purity": "warn",
    "react-hooks/set-state-in-render": "warn",
    "react-hooks/error-boundaries": "warn",
    "react-hooks/globals": "warn",
    "react-hooks/gating": "warn",
    "react-hooks/config": "warn",
  },
}, ...storybook.configs["flat/recommended"]];
