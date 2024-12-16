import * as csv from '../../src/csv';

test(`QueryEngine, test positive:`, async () => {
  let query: csv.Query;
  const table = new csv.Table();
  let result: any[];

  await table.load(`${__dirname}/samples/mixed.csv`);
  query = new csv.Query('PROJECT col1 FILTER col0 > "!", col1 > "20"');
  result = csv.QueryEngine.processAll(table, query);
  expect(result).toStrictEqual([['456']]);

  await table.load(`${__dirname}/samples/empty.csv`);
  query = new csv.Query('PROJECT col1');
  result = csv.QueryEngine.processAll(table, query);
  expect(result).toStrictEqual([]);

  await table.load(`${__dirname}/samples/one-line-mixed.csv`);
  query = new csv.Query('PROJECT col0');
  result = csv.QueryEngine.processAll(table, query);
  expect(result).toStrictEqual([['string']]);

  await table.load(`${__dirname}/samples/numbers.csv`);
  query = new csv.Query('PROJECT col1, col2 FILTER col0 >= "0", col3 < "40"');
  result = csv.QueryEngine.processAll(table, query);
  expect(result).toStrictEqual([
    ['1', '2'],
    ['6', '7'],
  ]);

  await table.load(`${__dirname}/samples/strings.csv`);
  query = new csv.Query('PROJECT col0, col3 FILTER col0 < "z", col3 > ""');
  result = csv.QueryEngine.processAll(table, query);
  expect(result).toStrictEqual([
    ['qwe', 'opa'],
    [' y ', ' y'],
  ]);
});

test('Query, test negative:', async () => {
  let query: csv.Query;
  const table = new csv.Table();
  let exceptionMessage: string = '';

  try {
    await table.load(`${__dirname}/samples/invalid.csv`);
  } catch (e: any) {
    exceptionMessage = e.message;
  }
  expect(`Invalid Record Length: expect 4, got 3 on line 3`).toBe(exceptionMessage);

  await table.load(`${__dirname}/samples/mixed.csv`);
  query = new csv.Query('PROJECT col5');
  try {
    csv.QueryEngine.processAll(table, query);
  } catch (e: any) {
    exceptionMessage = e.message;
  }
  expect(`Query PROJECT column index "5" larger then table columns count "4"`).toBe(exceptionMessage);

  await table.load(`${__dirname}/samples/mixed.csv`);
  query = new csv.Query('PROJECT col3 FILTER col999 > "!"');
  try {
    csv.QueryEngine.processAll(table, query);
  } catch (e: any) {
    exceptionMessage = e.message;
  }
  expect(`Query FILTER column index "999" larger then table columns count "4"`).toBe(exceptionMessage);
});
