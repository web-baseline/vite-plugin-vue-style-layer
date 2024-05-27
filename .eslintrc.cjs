/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');
const stylistic = require('@stylistic/eslint-plugin');

const customized = stylistic.configs.customize({
  semi: true,
  arrowParens: true,
  braceStyle: '1tbs',
});

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  plugins: [
    '@stylistic',
  ],
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    'dist',
  ],
  rules: {
    ...customized.rules,
    'no-useless-computed-key': ['error'],
    'no-console': ['warn'],
    '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
    '@stylistic/space-before-function-paren': ['error'],
    '@stylistic/function-call-spacing': ['error'],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
        },
      },
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: { max: 5 },
        multiline: { max: 5 },
      },
    ],
    'vue/block-order': [
      'error',
      {
        order: ['template', 'script', 'style'],
      },
    ],
    'vue/multi-word-component-names': ['error', {
      ignores: [
        'index',
      ],
    }],
  },
};
