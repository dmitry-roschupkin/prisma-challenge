import { logger } from '../Log';

/**
 * Interface for query filters storage.
 */
export interface QueryFilter {
  index: number;
  operator: string;
  value: string;
}

/**
 * Class for processing and storing Prisma Query Language (PQL) :-) data.
 */
export class Query {
  private _projects: number[] = [];
  private _filters: QueryFilter[] = [];

  private readonly queryRegex: RegExp = /^\s*PROJECT\s+(.+?)\s*(FILTER\s+(.+?)\s*)?\s*$/g;
  private readonly filterRegex: RegExp = /\s*(col\d+)\s+(.+?)\s+(".*?")(\s*,\s*|\s*$)/g;

  private readonly colPrefix: string = 'col';
  private readonly supportedOperators: string[] = ['=', '!=', '<>', '>', '>=', '<', '<='];

  /**
   * Contructor.
   *
   * _queryString storing "Prisma Query Language (PQL) :-)" original raw query string
   * @param _queryString
   */
  constructor(private _queryString: string) {
    this.parse();
  }

  /**
   * Getter for projects. It was done to split responsibility and move processing code to QueryEngine. Returned result
   * marked as readonly, but in practise result content can be changed.
   * No need to change "projects" outside, all changes with data have to be in this class.
   */
  public get projects(): readonly number[] {
    return this._projects;
  }

  /**
   * Getter for filters. It was done to split responsibility and move processing code to QueryEngine. Returned result
   * marked as readonly, but in practise result content can be changed.
   * No need to change "filters" outside, all changes with data have to be in this class.
   */
  public get filters(): readonly QueryFilter[] {
    return this._filters;
  }

  // NOTE:
  // We can implement some function like "setQuery" to make possibility use this class for different queries

  private parse(): void {
    this._projects = [];
    this._filters = [];

    logger.debug('Query: parsing start, query: ', this._queryString);

    this.queryRegex.lastIndex = 0;
    const match = this.queryRegex.exec(this._queryString);
    if (match === null || typeof match[1] === 'undefined') {
      throw Error(
        `Can't parse query. Query format have to be like: PROJECT col1, col2 FILTER col3 > "value".` +
          ` Current query ${this._queryString}`,
      );
    }

    this.parseProject(match[1]);
    if (typeof match[3] !== 'undefined') {
      this.parseFilters(match[3]);
    }

    logger.debug('Query: parsed success');
    logger.debug('Query: projects: ' + this._projects.toString());
    logger.debug('Query: filters: ' + JSON.stringify(this._filters));
  }

  private parseProject(projectString: string) {
    projectString = projectString.trim();
    const projectParts = projectString.split(',');
    for (const projectPart of projectParts) {
      const columnIndex = this.parseColumn(projectPart, 'PROJECT');
      this._projects.push(columnIndex);
    }
  }

  private parseColumn(columnName: string, section: string): number {
    columnName = columnName.trim();
    if (columnName.indexOf(this.colPrefix) !== 0) {
      throw Error(`Can't parse query. ${section} column "${columnName}" must have name prefix "col", e.g col1`);
    }

    const columnNameIndex = columnName.substring(this.colPrefix.length);
    const columnIndex = Number(columnNameIndex);
    if (isNaN(columnIndex) || columnIndex % 1 !== 0) {
      throw Error(
        `Can't parse query. ${section} column "${columnName}" must have name prefix "col" and` +
          ` integer index, e.g col1. Detected index is "${columnNameIndex}"`,
      );
    }

    return columnIndex;
  }

  private parseFilters(filterString: string) {
    logger.trace('Query: parsingFilters filterString: ', filterString);
    filterString = filterString.trim();
    if (filterString.length === 0) {
      return;
    }

    let match: RegExpExecArray | null;
    this.filterRegex.lastIndex = 0;
    let lastIndex: number = 0;
    while ((match = this.filterRegex.exec(filterString)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (match.index === this.filterRegex.lastIndex) {
        this.filterRegex.lastIndex++;
      }

      if (
        typeof match[0] === 'undefined' ||
        typeof match[1] === 'undefined' ||
        typeof match[2] === 'undefined' ||
        typeof match[3] === 'undefined'
      ) {
        throw Error(
          `Can't parse query. Each FILTER condition in "${filterString}" must consist of 3 parts` +
            ` (column, comparison operator, value). e.g. col1 > "value"`,
        );
      }

      const filterObject = this.parseFilter(match[1], match[2], match[3], match[0]);
      this._filters.push(filterObject);
      lastIndex = this.filterRegex.lastIndex;
    }

    const rest = filterString.substring(lastIndex);
    if (lastIndex < filterString.length) {
      throw Error(`Can't parse query. Can't parse FILTER string "${filterString}", condition: ${rest}`);
    }
  }

  private parseFilter(column: string, operator: string, value: string, filter: string): QueryFilter {
    logger.trace('Query: parsingFilter column, operator, value, filter: ', column, operator, value, filter);
    const index = this.parseColumn(column, 'FILTER');
    operator = this.parseOperator(operator, filter);
    value = this.parseValue(value, filter);

    return { index, operator, value };
  }

  private parseOperator(operator: string, filter: string): string {
    operator = operator.trim();
    if (this.supportedOperators.indexOf(operator) === -1) {
      throw Error(
        `Can't parse query. FILTER condition "${filter}" must have on of supported comparison operators: ` +
          this.supportedOperators.toString(),
      );
    }

    return operator;
  }

  private parseValue(value: string, filter: string): string {
    value = value.trim();
    const valueLength = value.length;
    if (valueLength < 2) {
      throw Error(
        `Can't parse query. FILTER condition "${filter}" value must have at least two symbols,` +
          ` and must be quoted, e.g. "value". Current parsed value: ${value}`,
      );
    }

    if (value[0] !== '"' || value[valueLength - 1] != '"') {
      throw Error(
        `Can't parse query. FILTER condition "${filter}" value must be quoted, e.g. "value".` +
          ` Current parsed value: ${value}`,
      );
    }

    return value.substring(1, valueLength - 1);
  }
}
