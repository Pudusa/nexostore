module.exports = {
  projects: [
    // --- Proyecto Frontend ---
    {
      displayName: 'frontend',
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\.(ts|tsx|js|jsx)$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.json',
            babelConfig: true, // Indica a ts-jest que use babel.config.js
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/test/frontend/**/*.spec.tsx', '<rootDir>/test/frontend/**/*.spec.ts'],
    },
    // --- Proyecto Backend ---
    {
      displayName: 'backend',
      testEnvironment: 'node',
      transform: {
        '^.+\.ts$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/backend/tsconfig.json',
          },
        ],
      },
      moduleDirectories: ['node_modules', '<rootDir>/backend/node_modules'],
      testMatch: ['<rootDir>/test/backend/**/*.spec.ts', '<rootDir>/test/backend/**/*.e2e-spec.ts'],
      moduleNameMapper: {
        '^@/auth/(.*)$': '<rootDir>/backend/src/auth/$1',
        '^@/users/(.*)$': '<rootDir>/backend/src/users/$1',
        '^@/products/(.*)$': '<rootDir>/backend/src/products/$1',
        '^@/prisma/(.*)$': '<rootDir>/backend/src/prisma/$1',
      },
    },
  ],
  collectCoverage: false,
};