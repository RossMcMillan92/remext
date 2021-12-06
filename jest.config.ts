/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/src/index.tsx',
    '<rootDir>/src/polyfills.ts',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true, // disable type checking for improved performance
    },
  },
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@src[/](.+)': '<rootDir>/src/$1',
    '^node_modules[/](.+)': '<rootDir>/node_modules/$1',
  },
  setupFiles: ['isomorphic-fetch'],
  setupFilesAfterEnv: [],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*(*.)@(spec|test).{js,jsx,ts,tsx}',
  ],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': require.resolve('ts-jest'),
  },
}
