const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
  collectCoverage: true,
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      // Thresholds are intentionally conservative given the current 2-test-file footprint.
      // Raise these incrementally as new tests are added (target: branches 60%, lines 70%).
      branches: 10,
      functions: 10,
      lines: 15,
      statements: 15,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
