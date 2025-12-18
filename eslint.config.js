import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginImport from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2025,
      sourceType: 'module',
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      'import': pluginImport,
      '@stylistic': stylistic,
    },
    rules: {
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      
      // === Стилистические правила ===
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/spaced-comment': ['error', 'always'],
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },
  },
  
  // === ДОБАВИЛ ИГНОРИРОВАНИЕ dist/ ===
  {
    ignores: [
      'node_modules/',
      'dist/',           
      '*.config.js',
      '*.yml'
    ]
  }
]