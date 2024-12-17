import fs from 'node:fs';
import * as path from 'node:path';

import { logger } from './Log';
import config from './config';
import * as csv from './csv';
import * as console from 'node:console';
import * as process from 'node:process';

logger.debug('Application: start');

/**
 * Print QueryEngine process results to console.
 *
 * @param result
 */
function printQueryEngineResults(result: Generator<any[]>): void {
  for (const record of result) {
    // We can use directly stdout here, instead of console.log, like this:
    // process.stdout.write(record.toString() + '\n');
    // "console.log use" uses "process.stdout.write" inside with adding formatting and adding "\n"
    console.log(record.toString());
  }
}

function printShortHelp() {
  console.log(
    'Please run this application with parameters "file path" and "query"\n' +
      'Examples:\n' +
      'npm run start ./tests/csv/samples/mixed.csv \'PROJECT col1, col2 FILTER col1 > \\"5\\"\'',
  );
}

/**
 * Main application function.
 */
async function main(): Promise<void> {
  logger.debug('Application: main start');
  const table = new csv.Table();

  if (typeof process.argv[2] === 'undefined' || typeof process.argv[3] === 'undefined') {
    console.log('Invalid arguments.');
    printShortHelp();
    return;
  }

  const filePath = process.argv[2];
  const queryString = process.argv[3];
  logger.debug('Process run with arguments: \n', process.argv);
  logger.debug('File path: ', filePath);
  logger.debug('Query: ', queryString);

  if (!fs.existsSync(filePath)) {
    throw Error(`Could not find file ${filePath}, full path: ${path.resolve(filePath)}`);
  }

  await table.load(filePath);
  const query = new csv.Query(queryString);

  const result = csv.QueryEngine.process(table, query);
  printQueryEngineResults(result);

  logger.debug('Application: main end');
}

main()
  .then(() => {
    // Process was finished without any errors
  })
  .catch((error: unknown): never => {
    // The "logger" wasn't used here, because exception can be thrown in the "logger"
    console.log('Application finished with error:');
    if (error !== null && typeof error === 'object' && 'message' in error) {
      console.error('Error: ' + error.message);
    }

    if (config.debug) {
      console.log(error);
    }

    printShortHelp();

    // We can delete this (and change return type to "void"), if we want to continue run process with errors
    process.exit(0);
  })
  .finally(() => {
    logger.debug('Application: end');
  });
