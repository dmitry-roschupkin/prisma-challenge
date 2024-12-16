import { Type } from './Type';

export abstract class BaseType implements Type {
  protected _options: any;

  public abstract checkValue(value: any): boolean;

  public abstract parse(value: any): any;

  public abstract compare(value1: any, value2: any): number;

  constructor(options?: any) {
    if (options !== undefined) {
      this._options = options;
    }
  }

  public eq(value1: any, value2: any): boolean {
    return this.compare(value1, value2) === 0;
  }

  public ne(value1: any, value2: any): boolean {
    return this.compare(value1, value2) !== 0;
  }

  public gt(value1: any, value2: any): boolean {
    return this.compare(value1, value2) > 0;
  }

  public lt(value1: any, value2: any): boolean {
    return this.compare(value1, value2) < 0;
  }

  public ge(value1: any, value2: any): boolean {
    return this.compare(value1, value2) >= 0;
  }

  public le(value1: any, value2: any): boolean {
    return this.compare(value1, value2) <= 0;
  }
}
