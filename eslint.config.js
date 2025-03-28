import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat();

export default [
  {
    ignores: ['coverage/**', 'dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      /* TypeScript Rules */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      /* Best Practices */
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'dot-notation': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      /* Style Rules */
      semi: ['error', 'always'],
      quotes: ['error', 'double', { avoidEscape: true }],
      indent: ['error', 2],
      'comma-dangle': ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      'max-len': ['warn', { code: 100 }],
      'object-curly-spacing': ['error', 'always'],

      /* Import Rules */
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal'],
          alphabetize: { order: 'asc' },
        },
      ],

      /* Prettier Rules */
      'prettier/prettier': 'error',
      ...prettier.rules,
    },
  },
  ...compat.extends('prettier'),
];
