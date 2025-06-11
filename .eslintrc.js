module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  exclude: ['node_modules', '.eslintrc.js'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': 'error',
  },
};
