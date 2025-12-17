import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

export default [
  js.configs.recommended,
  
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      // === ВСЕ правила из ошибок CI ===
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'always'],  // ВАЖНО: 'always', не 'as-needed'
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    }
  },
  
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly'
      }
    },
    rules: {
      // Простые правила без конфликтов
      'no-console': 'off',
      'no-param-reassign': ['error', { props: false }],
    }
  },
  
  {
    ignores: [
      'node_modules/',
      'dist/',
      '*.config.js',
      '*.yml',
      '*.yaml'
    ]
  }
]
