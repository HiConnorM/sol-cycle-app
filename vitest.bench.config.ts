import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Separate config so the benchmark doesn't run in the normal `pnpm test`
 * sweep — it is slow by design and its timings are machine-dependent.
 */
export default defineConfig({
  test: {
    include: ['lib/**/__benchmarks__/**/*.bench.ts'],
    environment: 'node',
    testTimeout: 120_000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
