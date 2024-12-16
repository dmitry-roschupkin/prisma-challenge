import * as csv from '.';
import { logger } from '../Log';

export class QueryEngine {
  public static processAll(table: csv.Table, query: csv.Query): any[] {
    const recordIterator = this.process(table, query);

    const allRecords: any[][] = [];
    for (const record of recordIterator) {
      allRecords.push(record);
    }

    return allRecords;
  }

  public static *process(table: csv.Table, query: csv.Query): Generator<any[]> {
    logger.debug('QueryEngine: start data processing');

    const data = table.data;
    const types = table.types;
    const projects = query.projects;
    const filters = query.filters;

    for (const record of data) {
      logger.trace('QueryEngine: processing record: ', record);
      const processedResult = this.processRecord(record, projects, filters, types);
      if (processedResult !== null) {
        logger.trace('QueryEngine: processed result record: ', processedResult);
        yield processedResult;
      }
    }

    logger.debug('QueryEngine: data processed');
  }

  public static processRecord(
    record: any[],
    projects: readonly number[],
    filters: readonly csv.QueryFilter[],
    types: readonly csv.type.Type[],
  ): any[] | null {
    const isPassFilters = this.isPassFilters(record, filters, types);
    logger.trace('QueryEngine: record isPassFilters: ', isPassFilters);
    if (!isPassFilters) {
      return null;
    }

    const result: any[] = [];
    const recordLength = record.length;
    for (const column of projects) {
      if (column > recordLength) {
        throw new Error(`Query PROJECT column index "${column}" larger then table columns count "${recordLength}"`);
      }
      result.push(record[column]);
    }
    return result;
  }

  private static isPassFilters(
    record: any[],
    filters: readonly csv.QueryFilter[],
    types: readonly csv.type.Type[],
  ): boolean {
    let isSucceeded: boolean = true;
    const recordLength = record.length;
    for (const filter of filters) {
      if (filter.index > recordLength) {
        throw new Error(
          `Query FILTER column index "${filter.index}" larger then table columns count "${recordLength}"`,
        );
      }

      const isPassFilter = this.isPassFilter(record[filter.index], filter, types[filter.index]);
      logger.trace(
        'QueryEngine: isPassFilter, value, filter, type: ',
        isPassFilter,
        record[filter.index],
        filter,
        types[filter.index],
      );

      if (!isPassFilter) {
        isSucceeded = false;
        break;
      }
    }

    return isSucceeded;
  }

  private static isPassFilter(value: any, filter: csv.QueryFilter, type: csv.type.Type): boolean {
    // NOTE: We have to make quotation or make correct binding of value if we will send request to DB.
    switch (filter.operator) {
      case '=':
        return type.eq(value, filter.value);
      case '!=':
        return type.ne(value, filter.value);
      case '<>':
        return type.ne(value, filter.value);
      case '>':
        return type.gt(value, filter.value);
      case '>=':
        return type.ge(value, filter.value);
      case '<':
        return type.lt(value, filter.value);
      case '<=':
        return type.le(value, filter.value);
      default:
        throw new Error(`Unknown query FILTER comparison operator: ${filter.operator} with value ${filter.value}.`);
    }
  }
}
