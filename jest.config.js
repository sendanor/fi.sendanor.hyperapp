/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testTimeout: 30000,
  moduleNameMapper: {
    "\\.(scss)$": "<rootDir>/empty-module.js",
  },
};
