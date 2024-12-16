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
    console.log(record);
  }
}

/**
 * Main application function.
 */
async function main(): Promise<void> {
  logger.debug('Application: main start');
  const table = new csv.Table();
  await table.load(`${__dirname}/../tests/csv/samples/mixed.csv`);

  const query = new csv.Query('PROJECT col1, col2 FILTER col0 > " z ", col3 > "5"');

  const result = csv.QueryEngine.process(table, query);
  printQueryEngineResults(result);

  logger.debug('Application: main end');
}

main()
  .then(() => {
    // Process was fished without any errors
  })
  .catch((error: unknown): never => {
    // The "logger" wasn't used here, because exception can be thrown in the "logger"
    console.log('Applications was finished with unexpected error');
    if (error !== null && typeof error === 'object' && 'message' in error) {
      console.error('Error: ' + error.message);
    }

    if (config.debug) {
      console.log(error);
    }

    // We can delete this (and change return type to "void"), if we want to continue run process with errors
    process.exit(0);
  })
  .finally(() => {
    logger.debug('Application: end');
  });
