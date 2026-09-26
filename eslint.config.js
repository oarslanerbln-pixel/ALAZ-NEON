import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // src/ yalnızca .ts/.tsx içerir. Oradaki her .js/.d.ts yanlışlıkla üretilmiş
  // derleme çıktısıdır (yanlış yapılandırılmış bir composite tsconfig bunu bir
  // kez yaptı ve lint'i anlamsız hatalarla doldurdu) — lint'e sokma.
  globalIgnores([
    'dist',
    'src/**/*.js',
    'src/**/*.d.ts',
    'src/**/*.js.map',
    'src/**/*.d.ts.map',
    'test/**/*.js',
    'test/**/*.d.ts',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React Compiler readiness rules from eslint-plugin-react-hooks v7.
      // This project doesn't use React Compiler; flag as warnings instead of
      // failing the build, since fixing every animation/particle-generation
      // callsite requires visual re-verification rather than a mechanical edit.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
])
