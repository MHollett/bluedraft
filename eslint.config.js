import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Rules here are the strongest guardrail agents have: a rule cannot be skipped
// the way an instruction can. When review keeps catching the same mistake,
// add a rule here instead of a line in CLAUDE.md.

export default defineConfig(
  {
    ignores: [
      'dist',
      'node_modules',
      'db/migrations',
      'playwright-report',
      'test-results',
      '.vercel',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/server', '**/server/*', '**/db', '**/db/*', '**/api', '**/api/*'],
              allowTypeImports: true,
              message:
                'The browser may only import *types* from server/, db/ or api/. Put shared runtime code in shared/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/server/*', '**/db/*', '**/src/*', 'react', 'react-dom', 'drizzle-orm*'],
              message:
                'shared/ is imported by both browser and server; keep it dependency-free (zod is fine).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['server/**', 'api/**', 'db/**', 'e2e/**', '*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
