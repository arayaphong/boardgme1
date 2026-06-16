module.exports = {
  testEnvironment: "node",
  collectCoverage: false,
  coverageDirectory: "coverage",
  testMatch: ["<rootDir>/src/test/**/*.test.js"],
  verbose: true,
  transform: {
    "^.+\\.js$": "babel-jest"
  }
};
