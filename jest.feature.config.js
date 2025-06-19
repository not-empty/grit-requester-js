const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  displayName: 'feature',
  testMatch: ['<rootDir>/tests/feature/**/*.test.ts'],
  coverageDirectory: '<rootDir>/coverage/feature',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
};