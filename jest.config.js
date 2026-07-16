/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'jest-expo/node',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
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
  // カバレッジ閾値は services / utils の実装が揃う Task 9 で有効化する
  // coverageThreshold: {
  //   global: { lines: 70 },
  // },
};
