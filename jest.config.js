export default {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@ascii-chart$': '<rootDir>/src/index.ts',
    '^@constants$': '<rootDir>/src/constants/index.ts',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@examples$': '<rootDir>/src/examples/index.ts',
    '^@examples/(.*)$': '<rootDir>/src/examples/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types$': '<rootDir>/src/types/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageThreshold: {
    global: {
      statements: 99,
      branches: 99,
      functions: 99,
      lines: 100,
    },
  },
};
