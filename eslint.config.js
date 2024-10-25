// eslint.config.js
const typescript = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'], // Top-level ignores
  },
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    rules: {
      'import/extensions': 'off',
      'no-param-reassign': 'off',
    },
    files: ['*.ts', '*.js'],
    settings: {
      jest: true,
      browser: true,
    },
  },
];
