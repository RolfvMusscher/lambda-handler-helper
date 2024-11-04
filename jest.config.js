// eslint-disable-next-line @typescript-eslint/no-require-imports
var argv = require('yargs').argv;

module.exports = {
	preset: 'ts-jest',
	clearMocks: true,
	collectCoverage: true,
	verbose: true,
	rootDir: '.',
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/dist/**/*',
		'!<rootDir>/bin/**/*.ts',
	],
	coverageReporters: ['json'],
	testMatch: ['<rootDir>/test/**/*.test.ts'],
	coverageDirectory: argv.coverageDirectory || './coverage',
	moduleFileExtensions: ['ts', 'js'],
	testEnvironment: 'node',
	transform: {
		'\\.ts$': 'ts-jest',
	},
};