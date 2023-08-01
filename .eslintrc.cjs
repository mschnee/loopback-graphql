/** @type {import('eslint/lib/config')} */
module.exports = {
  root: true,
  extends: '@loopback/eslint-config',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
};
