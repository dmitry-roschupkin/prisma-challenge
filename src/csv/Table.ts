import fs from 'node:fs';
import { parse } from 'csv-parse';
import * as type from './type';
import { logger } from '../Log';

/**
 * Class for loading (including detecting types) and storing scv table data.
 */
export class Table {
  private _possibleTypes: type.Type[] = [];

  private _typeIndexes: number[] = [];
  private _types: type.Type[] = [];

  private _data: any[][] = [];

  /**
   * Constructor
   *
   * @param possibleTypes - types which we need to detect and process in the loading csv table.
   * Types will be processed from left to right.
   * E.g.: For array [new type.Integer(), new type.String()] - if checking for type integer was successful -
   * we wouldn't try to check for string. If checking for type integer wasn't successful - we will try to check
   * for string, etc.
   */
  constructor(possibleTypes: type.Type[] = [new type.Integer(), new type.String()]) {
    this.setPossibleTypes(possibleTypes);
  }

  /**
   * @see {@link constructor}
   *
   * @param possibleTypes
   */
  // Possible to make Table "re-useful" with different _types, using next function
  public setPossibleTypes(possibleTypes: type.Type[]): void {
    if (possibleTypes.length === 0) {
      throw new Error('Table must have at least one possible type');
    }

    this._possibleTypes = possibleTypes;
  }

  /**
   * Getter for data. It was done to split responsibility and move processing code to QueryEngine. Returned result
   * marked as readonly, but in practise result content can be changed.
   * No need to change "data" outside, all changes with data have to be in this class.
   */
  public get data(): readonly any[][] {
    return this._data;
  }

  /**
   * Getter for types. It was done to split responsibility and move processing code to QueryEngine. Returned result
   * marked as readonly, but in practise result content can be changed.
   * No need to change "types" outside, all changes with data have to be in this class.
   */
  public get types(): readonly type.Type[] {
    return this._types;
  }

  /**
   * This function load csv table from file to memory, and detect csv column types.
   *
   * @param filepath - path to csv file
   */
  public async load(filepath: string): Promise<boolean> {
    const parser = fs.createReadStream(filepath).pipe(parse({}));
    this._data = [];
    this._types = [];

    logger.debug('Table: load Start loading, possible types: ');
    this._possibleTypes.forEach(function (element) {
      logger.debug(element.constructor.name, JSON.stringify(element));
    });

    let isTypeIndexesFilled = false;
    for await (const record of parser) {
      if (!isTypeIndexesFilled) {
        this.fillTypeIndexes(record);
        isTypeIndexesFilled = true;
      }
      this.checkAndAddRow(record);
      logger.trace('Table: record:', record);
    }

    logger.debug('Table: data loaded');
    this.fillType();

    logger.debug('Table: types: ');
    this._types.forEach(function (element): void {
      logger.debug(element.constructor.name, JSON.stringify(element));
    });

    return true;
  }

  private checkAndAddRow(record: any[]): void {
    const recordLength: number = record.length;
    const possibleTypeLength: number = this._possibleTypes.length;
    for (let i: number = 0; i < recordLength; i++) {
      for (let j: number = this._typeIndexes[i]; j < possibleTypeLength; j++) {
        if (this._possibleTypes[j].checkValue(record[i])) {
          this._typeIndexes[i] = j;
          break;
        }
      }
    }
    this._data.push(record);
  }

  private fillTypeIndexes(record: any[]): void {
    const recordLength = record.length;

    this._typeIndexes = [];
    for (let i: number = 0; i < recordLength; i++) {
      this._typeIndexes.push(0);
    }
  }

  private fillType(): void {
    this._typeIndexes.forEach((i): void => {
      this._types.push(this._possibleTypes[i]);
    });
  }
}
