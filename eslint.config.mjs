import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  prettierConfig,
  {
    files: ['app/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 20],
      'max-depth': ['warn', 4],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': 'off',
    },
  },
  // Debt ratchet: these pre-existing files exceed the 300-line standard.
  // Their effective-line ceilings match today's baseline, so they cannot grow.
  // Split them into focused modules before lowering/removing these overrides.
  {
    files: ['app/page.tsx'],
    rules: {
      'max-lines': ['error', { max: 325, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['app/components/DiscontinuationNotice.tsx'],
    rules: {
      'max-lines': ['error', { max: 421, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
