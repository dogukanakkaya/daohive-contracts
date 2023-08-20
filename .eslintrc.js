module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': ['off'],
    'no-multiple-empty-lines': [
      'error',
      { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }
    ],
    'padded-blocks': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'require-await': 'error',
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'indent': ['error', 2],
    'semi': ['error', 'never']
  },
}