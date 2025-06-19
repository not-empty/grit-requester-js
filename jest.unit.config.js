const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  displayName: 'unit',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  coverageDirectory: '<rootDir>/coverage/unit',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
};