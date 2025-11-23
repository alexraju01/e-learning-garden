// eslint.config.js

import globals from 'globals';
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // -------------------------------------------------------------
  // 1. BASE CONFIGURATION (Applied to all files by default)
  // -------------------------------------------------------------
  {
    // Ignore files/directories
    ignores: ['node_modules/', 'dist/', 'build/'],

    // Base rules for ALL files
    ...js.configs.recommended,
    ...prettierRecommended,

    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        ...globals.es2021,
      },
    },

    rules: {
      'no-unused-vars': [
        'warn', // Treat unused variables as an error
        {
          vars: 'all', // Check all variables
          args: 'after-used', // Only check arguments that appear after the last used argument
        },
      ],

      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],

      // 🛑 Common Rules for ALL code
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
    },
  },

  // -------------------------------------------------------------
  // 2. OVERRIDES (Specific rules for backend and frontend)
  // -------------------------------------------------------------

  // ➡️ A. BACKEND OVERRIDES (Node/Express code)
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Setting no-console to 'error' for the backend
      'no-console': 'error',
      'no-undef': 'error',
      // Note: prefer-arrow-callback and func-style are now in the Base Config
    },
  },

  // ➡️ B. FRONTEND OVERRIDES (React/JSX code)
  {
    files: ['frontend/**/*.{js,jsx}'],

    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Custom rules
      'no-console': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // Language configuration for browser globals and JSX
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      // Note: prefer-arrow-callback and func-style are now in the Base Config
    },
  },
];
