import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

const typescriptRecommended = typescript.configs['flat/recommended'].map((config) => ({
  ...config,
  files: ['**/*.ts'],
}));

const importLayoutRules = {
  'import/newline-after-import': 'error',
  'import/order': [
    'error',
    {
      alphabetize: {
        caseInsensitive: true,
        order: 'asc',
      },
      distinctGroup: false,
      groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
      'newlines-between': 'always',
      pathGroups: [
        {
          group: 'internal',
          pattern: '@ascii-chart',
          position: 'before',
        },
        {
          group: 'internal',
          pattern: '@{constants,examples,helpers,services,types}',
          position: 'before',
        },
        {
          group: 'internal',
          pattern: '@{constants,examples,helpers,services}/**',
          position: 'before',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          message: 'Use a configured @ alias instead of a parent-relative import.',
          regex: '^\\.\\./',
        },
      ],
    },
  ],
  'padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: 'export' },
    { blankLine: 'always', prev: 'export', next: '*' },
    { blankLine: 'any', prev: 'export', next: 'export' },
  ],
  'sort-imports': [
    'error',
    {
      allowSeparatedGroups: true,
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
    },
  ],
};

const documentedDeclarationTypes = new Set([
  'VariableDeclaration',
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
]);

const exportDocumentation = {
  rules: {
    'require-type-files': {
      create(context) {
        const filename = context.filename.replaceAll('\\', '/');
        const usesDedicatedTypeFile =
          filename.endsWith('/types.ts') || filename.includes('/types/');

        return {
          TSTypeAliasDeclaration(node) {
            if (!usesDedicatedTypeFile) {
              context.report({
                node,
                message: 'Move type aliases to a dedicated types.ts file or types folder.',
              });
            }
          },
        };
      },
      meta: {
        schema: [],
        type: 'suggestion',
      },
    },
    'require-export-docs': {
      create(context) {
        const sourceCode = context.sourceCode;
        const checkDocumentation = (node) => {
          const comment = sourceCode
            .getCommentsBefore(node)
            .findLast(({ type, value }) => type === 'Block' && value.startsWith('*'));
          if (!comment) {
            context.report({ node, message: 'Missing JSDoc comment for exported declaration.' });
            return;
          }
          const lines = comment.value
            .slice(1)
            .split('\n')
            .map((line) => line.replace(/^\s*\*\s?/, ''));
          const firstTag = lines.findIndex((line) => line.startsWith('@'));
          const descriptionText = (firstTag === -1 ? lines : lines.slice(0, firstTag))
            .join(' ')
            .trim();
          if (!descriptionText) {
            context.report({ node, message: 'Exported declaration JSDoc needs a description.' });
          }
        };
        const checkExport = (node) => {
          if (node.declaration && documentedDeclarationTypes.has(node.declaration.type)) {
            checkDocumentation(node);
          }
        };

        return {
          ExportDefaultDeclaration: checkExport,
          ExportNamedDeclaration: checkExport,
          MethodDefinition(node) {
            const classDeclaration = node.parent?.parent;
            const exportDeclaration = classDeclaration?.parent;
            if (
              node.accessibility !== 'private' &&
              classDeclaration?.type === 'ClassDeclaration' &&
              (exportDeclaration?.type === 'ExportNamedDeclaration' ||
                exportDeclaration?.type === 'ExportDefaultDeclaration')
            ) {
              checkDocumentation(node);
            }
          },
        };
      },
      meta: {
        schema: [],
        type: 'suggestion',
      },
    },
  },
};

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  eslint.configs.recommended,
  ...typescriptRecommended,
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: fixupPluginRules(importPlugin),
      jsdoc,
      local: exportDocumentation,
    },
    rules: {
      ...importLayoutRules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      'import/extensions': 'off',
      'import/no-duplicates': 'error',
      complexity: ['error', 30],
      eqeqeq: 'error',
      'max-lines': [
        'error',
        {
          max: 600,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-constant-binary-expression': 'error',
      'no-param-reassign': 'off',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'error',
      'no-useless-assignment': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'error',
      'local/require-export-docs': 'error',
      'local/require-type-files': 'error',
      'no-restricted-properties': [
        'error',
        {
          object: 'describe',
          property: 'only',
          message: 'describe.only should not be committed to version control.',
        },
        {
          object: 'it',
          property: 'only',
          message: 'it.only should not be committed to version control.',
        },
        {
          object: 'test',
          property: 'only',
          message: 'test.only should not be committed to version control.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration',
          message: 'Use a typed const arrow function instead of a function declaration.',
        },
        {
          selector: 'FunctionExpression:not([parent.type="MethodDefinition"])',
          message: 'Use an arrow function instead of a function expression.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      ...importLayoutRules,
      eqeqeq: 'error',
      'import/extensions': 'off',
      'import/no-duplicates': 'error',
      'max-lines': [
        'error',
        {
          max: 600,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-constant-binary-expression': 'error',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'error',
      'no-useless-assignment': 'error',
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    files: ['src/__tests__/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'max-lines': [
        'error',
        {
          max: 2000,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': 'off',
      'no-control-regex': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/__tests__/**', 'src/examples/**', 'src/scripts/**'],
    rules: {
      complexity: ['error', 15],
      'max-lines-per-function': [
        'error',
        {
          max: 120,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
];
