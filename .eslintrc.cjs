
const BUNDLE_FOR_PROD = process.env.NODE_ENV === 'production'

const custom_rules = {
  'no-console': BUNDLE_FOR_PROD ? 'error' : 'warn',
  'no-debugger': BUNDLE_FOR_PROD ? 'error' : 'warn',
  camelcase: 'off',
  'prefer-promise-reject-errors': 'off',
  'no-throw-literal': 'off',
  'no-mixed-operators': 'off',
  'comma-dangle': ['error', 'always-multiline'],
  'no-trailing-spaces': [
    'error', {
      skipBlankLines: true,
    },
  ],
  'no-unused-vars': [
    'warn',
    {
      args: 'after-used',
      argsIgnorePattern: '^_\\w+',
    },
  ],

  // TODO: drop out following rules:
  'no-var': ['off'],
  'multiline-ternary': ['off'],
}

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'standard',
  ],
  rules: custom_rules,
  overrides: [
    {
      files: ['{,**/}*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'standard-with-typescript',
      ],
      plugins: [
        '@typescript-eslint',
      ],
      rules: {
        ...custom_rules,
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
      },
    },
    {
      files: ['{,**/}*.spec.js'],
      env: { jest: true },
    },
  ],
}
