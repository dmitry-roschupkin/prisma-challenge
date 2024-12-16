import { BaseType } from './BaseType';

export abstract class Number extends BaseType {
  public abstract checkValue(value: string | number): boolean;

  public parse(value: string | number): number {
    // Also possible to use other decisions instead of "globalThis", e.g. parseInt() or renaming class.
    return globalThis.Number(value);
  }

  public compare(value1: any, value2: any): number {
    const number1 = this.parse(value1);
    const number2 = this.parse(value2);
    return number1 === number2 ? 0 : number1 > number2 ? 1 : -1;
  }
}
