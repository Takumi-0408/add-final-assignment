/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'jest-expo/node',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/src/**/__tests__/**/*.test.tsx',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/services/**/*.ts',
        'src/utils/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
      ],
    },
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
};
