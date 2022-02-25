module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    quotes: ['warn', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': ['warn', 'always-multiline'],
    'spaced-comment': ['warn', 'always'],
    'no-undef': ['warn', { typeof: true }],
    'no-unused-vars': ['warn', {}],
    'require-await': ['warn'],
    'no-mixed-operators': ['off'],
    curly: ['warn', 'multi'],
    'no-unused-expressions': ['warn', { allowTernary: true }],
    'no-throw-literal': ['warn'],
    'no-unreachable': ['warn'],
    'no-multiple-empty-lines': ['warn'],
    'unicorn/prefer-includes': ['off'],
    'vue/this-in-template': ['off'],
    'vue/no-unused-components': ['warn'],
  },
}
