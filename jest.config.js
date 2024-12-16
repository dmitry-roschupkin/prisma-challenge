module.exports = {
  preset: 'ts-jest', // Use ts-jest preset for testing TypeScript files with Jest
  testEnvironment: 'node', // Set the test environment to Node.js
  roots: ['<rootDir>/tests'], // Define the root directory for tests and modules
  transform: {
    // Use ts-jest to transform TypeScript files
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '((\\.|/)(test|spec))\\.tsx?$', // Regular expression to find test files
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // File extensions to recognize in module resolution
};
