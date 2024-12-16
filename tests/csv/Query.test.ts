import * as csv from '../../src/csv';

test(`Query, test positive:`, () => {
  let query: csv.Query;

  query = new csv.Query('PROJECT col1 FILTER col0 > "testStringValue"');
  expect(query.projects).toStrictEqual([1]);
  expect(query.filters).toStrictEqual([{ index: 0, operator: '>', value: 'testStringValue' }]);

  query = new csv.Query('PROJECT col1, col2 FILTER col0 >= "z ", col3 != "555", col2 = "col2"');
  expect(query.projects).toStrictEqual([1, 2]);
  expect(query.filters).toStrictEqual([
    { index: 0, operator: '>=', value: 'z ' },
    { index: 3, operator: '!=', value: '555' },
    { index: 2, operator: '=', value: 'col2' },
  ]);

  query = new csv.Query('PROJECT col0, col21, col3 FILTER col42 <= " , , "" ##", col18 < "@", col19 <> ""');
  expect(query.projects).toStrictEqual([0, 21, 3]);
  expect(query.filters).toStrictEqual([
    { index: 42, operator: '<=', value: ' , , "" ##' },
    { index: 18, operator: '<', value: '@' },
    { index: 19, operator: '<>', value: '' },
  ]);

  query = new csv.Query('PROJECT col0, col2');
  expect(query.projects).toStrictEqual([0, 2]);
  expect(query.filters).toStrictEqual([]);
});

test('Query, test negative:', () => {
  let exceptionMessage: string = '';

  try {
    new csv.Query('');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(
    `Can't parse query. Query format have to be like: PROJECT col1, col2 FILTER col3 > "value". Current query `,
  ).toBe(exceptionMessage);

  try {
    new csv.Query('PROJECT ');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(
    `Can't parse query. Query format have to be like: PROJECT col1, col2 FILTER col3 > "value". Current query PROJECT `,
  ).toBe(exceptionMessage);

  try {
    new csv.Query('PROJECT col1, col2 FILTER col0 > "z" ;');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(`Can't parse query. Can't parse FILTER string "col0 > "z" ;", condition: col0 > "z" ;`).toBe(exceptionMessage);

  try {
    new csv.Query('PROJECT col1, col2 FILTER col0 > z');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(`Can't parse query. Can't parse FILTER string "col0 > z", condition: col0 > z`).toBe(exceptionMessage);

  try {
    new csv.Query('PROJECT col1, col2 FILTER col0 > z , col3 < "555"');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(
    `Can't parse query. FILTER condition "col0 > z , col3 < "555"" must have on of supported comparison operators: =,!=,<>,>,>=,<,<=`,
  ).toBe(exceptionMessage);

  try {
    new csv.Query('PROJECT col1, col2 FILTER col0 > "z" , col3 < 555');
  } catch (error: any) {
    exceptionMessage = error.message;
  }
  expect(`Can't parse query. Can't parse FILTER string "col0 > "z" , col3 < 555", condition: col3 < 555`).toBe(
    exceptionMessage,
  );
});
