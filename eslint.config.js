import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

export default [
  // Базовые правила ESLint
  js.configs.recommended,
  
  // Правила Stylistic с ПРЕФИКСОМ @stylistic/
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      // === ВАЖНО: используй @stylistic/ префикс! ===
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', 'stroustrup'],
    }
  },
  
  // Настройки для файлов
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
      // === Твои кастомные правила ===
      'no-console': 'off',
      'import/extensions': 'off',
      'no-trailing-spaces': 'error',
      'arrow-body-style': 'off',
      'consistent-return': 'off',
      'no-param-reassign': ['error', { props: false }],
      'import/no-unresolved': 'off',
    }
  },
  
  // Игнорируемые файлы
  {
    ignores: [
      'node_modules/',
      'dist/',
      '*.config.js',
      '*.yml'
    ]
  }
]
