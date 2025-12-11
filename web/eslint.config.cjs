/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

const vue = require('eslint-plugin-vue');

module.exports = [
  // Vue recommended rules for Vue 3
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.vue', '**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      vue,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
