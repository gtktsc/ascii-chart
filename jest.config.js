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
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
