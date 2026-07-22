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
<<<<<<< HEAD
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
=======
>>>>>>> pull-1
  collectCoverage: true,
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      // Thresholds are intentionally conservative given the current 2-test-file footprint.
      // Raise these incrementally as new tests are added (target: branches 60%, lines 70%).
<<<<<<< HEAD
      branches: 10,
      functions: 10,
      lines: 15,
      statements: 15,
=======
      branches: 20,
      functions: 15,
      lines: 25,
      statements: 25,
>>>>>>> pull-1
    },
  },
}

module.exports = createJestConfig(customJestConfig)
