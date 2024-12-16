import { Number } from './Number';

export interface IntegerOptions {
  checkRegexp: RegExp;
}

export class Integer extends Number {
  constructor(
    options: IntegerOptions = {
      checkRegexp: new RegExp(/^\d+$/),
    },
  ) {
    super(options);
  }

  public checkValue(value: string | number): boolean {
    if (typeof value === 'string') {
      return this._options.checkRegexp.test(value);
    }

    if (typeof value === 'number') {
      return value % 1 === 0;
    }

    return false;
  }
}
