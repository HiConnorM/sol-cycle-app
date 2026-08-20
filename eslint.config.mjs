import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      // Generated native project, and the archived Flutter / v0 apps.
      'ios/**',
      'sol_cycle/**',
      'sol-cycle-app/**',
      // Obsidian vault — its bundled plugin JS is large enough to OOM eslint.
      'SOL-data/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // `_`-prefixed names are the codebase's existing convention for
      // deliberately unused bindings (see app/layout.tsx font imports).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
