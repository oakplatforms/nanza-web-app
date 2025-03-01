import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import jest from 'eslint-plugin-jest'

/**@type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['src/types/tcgx-schemas.ts'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx,test.ts}'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: { sourceType: 'module' },
    plugins: { jest },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      'semi': ['error', 'never'],
      'indent': ['error', 2],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'no-inline-comments': 'error',
      'spaced-comment': ['error', 'never'],
      'react/jsx-no-comment-textnodes': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'BlockComment',
          message: 'Block comments are not allowed.'
        }
      ],
      'react/react-in-jsx-scope': 'off',
    },
  }
]
