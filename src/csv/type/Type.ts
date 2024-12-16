export interface Type {
  checkValue(value: any): boolean;
  parse(value: any): any;

  eq(value1: any, value2: any): boolean;
  ne(value1: any, value2: any): boolean;
  gt(value1: any, value2: any): boolean;
  lt(value1: any, value2: any): boolean;
  ge(value1: any, value2: any): boolean;
  le(value1: any, value2: any): boolean;

  compare(value1: any, value2: any): number;
}
