const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      }
    ]
  }
};
