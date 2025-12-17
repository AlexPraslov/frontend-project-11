import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

// Экспортируем МАССИВ конфигов БЕЗ defineConfig
export default [
  // 1. Базовые правила ESLint
  js.configs.recommended,

  // 2. Стилистические правила (@stylistic)
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      // Правила из CI (смотрим на твои ошибки линтинга)
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-multi-spaces': ['error'],
    }
  },

  // 3. Настройки для JS файлов
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
      'no-console': 'off',
      'no-param-reassign': ['error', { props: false }],
    }
  },

  // 4. Игнорируемые файлы (ВМЕСТО .eslintignore)
  {
    ignores: [
      'node_modules/',
      'dist/',
      '*.config.js',
      '*.yml'
    ]
  }
]
