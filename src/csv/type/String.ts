import { BaseType } from './BaseType';

export interface StringOptions {
  compareLocales: string | undefined;
  compareOptions: object;
}

export class String extends BaseType {
  constructor(
    options: StringOptions = {
      compareLocales: undefined,
      compareOptions: {},
    },
  ) {
    super(options);
  }

  public checkValue(value: string): boolean {
    return typeof value === 'string';
  }

  public parse(value: string | number): string {
    // Also possible to use other decisions instead of "globalThis", e.g. value.toSting() or renaming class.
    return globalThis.String(value);
  }

  public compare(value1: any, value2: any): number {
    if (typeof value1 !== 'string') {
      value1 = this.parse(value1);
    }
    if (typeof value2 !== 'string') {
      value2 = this.parse(value2);
    }
    return value1.localeCompare(value2, this._options.compareLocales, this._options.compareOptions);
  }
}
