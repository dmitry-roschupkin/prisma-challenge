## About ##
This project was done as prisma Home Challenge. More details you can read in
`./docs/Prisma Core Take Home Challenge.pdf`

## Run ##
After cloning the project, we need to install dependencies

We need to compile the project and at least for this we are needed development dependencies. Run this command to
install dependencies for development mode.
```shell script
npm install
```

To compile project need to run this command:
```shell script
npm run build
```

To run project need to run this command:
```shell script
npm run start
```

To run tests need to run this command:
```shell script
npm run test
```

To prepare production mode (this project isn't ready for production now :-) ) -
we can delete node_modules, and run this command:
```shell script
npm install --production
```
Now our compiled code is in `./dist` directory and our production dependency in `./node_modules`
directory.


#### For developers also available next commands: ####

Clean `./dist` directory to prepare for full rebuild
```shell script
npm run clean
```

Run tests in watch mode:
```shell script
npm run test:watch
```

Check syntax and formating using `ESLint` and `prettier`:
```shell script
npm run lint
```

Fix some easy errors in code e.g. formating errors (Not all errors can be fixed in ths way):
```shell script
npm run lint:fix
```

Run watcher/monitor for main project for development:
```shell script
npm run dev
```

### Report ###
#### Compromises that was made during development ###
- Double processing... I can't detect columns types before loading all the data (unless you read the file twice)
because in each column can be `string` instead `integer`, even in the last row. That's why I can't make data filtering
during the loading. I have to load data and detect types during the loading, and only then make a filtering of the
loaded data. But exactly this way was described in task, so I think that's ok. The data filtering could be done during 
the loading if e.g. we will change file format and detect types from first line, or e.g. we will use just `string` types.
In both cases we can do something like this:
    ```javascript
    fs.createReadStream(filepath)
      .pipe(csv.parse())
      .pipe(csv.transform((record) => {
        return QueryEngine.processRecord(...)
       }))
      .pipe(csv.stringify())
      .pipe(process.stdout);
    ```

- Not all the functionality was covered by tests, but I have created some tests as examples, other tests can be created 
in the same way.

- The tests data wasn't prepared as it have to be, with readable and "similar to real" test data. Probably it make tests
not so readable as it can be, but time was limited, and I decided to not spend the time to prepare beautiful test data.
Stress test, tests for large data etc., wasn't done too.

- Profiling and primary optimization wasn't done, also because of time limit. But it will be not difficult to detect a
neck(s) and make some optimization, if it will need, because the code enough structured and readable.

- Not all functions and classes was commented because of time limit, but I have commented classes and public functions
for `Table`, `Query` and `QueryEngine` as an example using `TSDoc` format. Others can be commented in the same way.

- Maybe that regular expressions, used for parsing PQL (Prisma Query Language) isn't perfect and may be possible to
make it a little bit better. But it's works, I decided to not spend like a 2,5 hours fot this (a half of estimated
time for this job). The regular expression work is localized, and will be easy to update/fix them if more perfect 
decisions will be found.

- I haven't done any interactive interface, even for reading data from console command. But this is enough typical
tasks, it can be done using `process.argv`, so I decided to spend time for other things, which I have found more
important. Time was limited +/-, but it's possible to add this in the next iteration...

- Any interactive help or other commands with using arguments (like `--help`, `--version` etc.) wasn't done, also 
because of time limits.

- In classes `Query` and `Table` private data wasn't fully hidden from outside modification. 
I have added modifier readonly to data getters return type, but it's possible to modify data from outside anyway. 
But this is enough typical situation for typescript.

- ...

### Adding other data types, filters, ordering ###
- To add new supported data type possible to make new classes inherited e.g. from `BaseType` and implements `Type` 
interface. Then need to add this class to `Table` `constructor` or pass it to `setPossibleTypes` function in needed
order. Order is important, see class `TSDoc` description for more details.

- The possibility of many filters using - already implemented, but only using `AND` filters concatenation. Possible to
implement multiple filter (one filter array with many conditions, each condition will be the same as now). Using
multiple filter will be possible to implement filters concatenation `OR` and also will be possible to implement using 
brackets. Something like: `FILTER f1 and (f2 or f3 of f4)` in this case wi will have one filter `f1` and one multiple
filter `(f2 or f3 or f4)`. Multiple filter will be applied in the same algorithm as for filter.
If we complicate more - multiple filter will have a tree of child filters and some of them will be multiple too...

- To implement ordering without implementation of `indexes` - we can:
  1. Accumulate result data, and each new founded/filtered record have to be inserted in ordered place in results
     data. In this case result data will be every time ordered. Complexity from ~Q(n*log(n)) up to ~Q2 (dependent 
     on data), but in generally it will be quicker then sort full the table and only then make a filtration.
  2. We can try to make our own indexes (like `Map<value: string, positionInTable: number>` or own map
     implementation). Index will be sorted automatically, and it allows for us to make quick filter and ordering the
     results. We can use e.g. bisection method to find needed places in sorted index.
     In this case complexity will be ~Q +/-.

### Process extremely large datasets ###
When we use really extremely large datasets - sometimes we can't even to load full the index in memory. In this case we
need to store huge index in storage `HDD/SSD/...` and read index partially, by blocks. The same as we can try to find 
needed place im memory index, e.g. using bisection method - we will try to use the same method to find needed place in
index file... (e.g. jump to center, read block and compare values, then jump to some center of half and read block 
again and compare values, etc.). Then we have read from index needed records addresses (e.g. byte addresses `from` 
and `to`) in huge table file, and we can read one by one all needed records...
Also, we will to work with bytecode, bytes types aligns and will be better to rewrite this e.g. using `C++`. I know and I
like modern `C++` and I can be helpful with this LOL :-).

### Other ideas ###
- `jest` is very popular for testing but also possible to use other tools, e.g. `Cucumber` or others.

- Possible to make common interface for `Table` and to make adapters for different file types storage and for other
types of storage (e.g. database, web, ...). Then we can have a factory method which will return for as an object
of common interface, dependent on resource type. This object of common interface we can use in common logic 
independent of certain file storage implementation.

- the `PROJECT` statement can use `*` instead of columns list, which will mean that need to project all columns.

- Possible to add functionality to allow change filters and values for left to right, e.g.
`... FILTER col1 = "value"` and also `... FILTER "value" == col1`.

- We can add possibility to set some path to folder with tables files, and then we can use file names in PQL e.g. in
`FROM` clause, like `PROJECT col1, col3 FROM filename FILTER ...`. Then possible to add `JOIN`'s (will be nice to 
implement some `indexes` and `keys` before this).

- ... 

### Make this code production-ready ###
- Need to add interactive interface, e.g. command line.
- Need to implement possibility to set some parameters, at least basic, like locale e.g. `En/Fr/Ge/..`,
separator symbol, quoted/unquoted values, digit format for float e.g. `.` or `,`, date formats...
- Add possibility to skip first rows.
- Need to cover app by tests more detailed, using different type of test: static, unit, integration, E2E...
- Need to write documentation (offline/online).
- Need to make better usable installation, e.g. make npm package, or package for debian package manager...
- Test application with different environments, including different `node` version, different OS and different
possible dependency versions. Set up needed `peerDependencies` etc...
- Take feedback from first demo users, make conclusions and make first fixes/changes.
- ...

### What and when we have to implement ###
It's a difficult question and it can ve very subjective. In my opinion one of good ways is:
- Make a tasks/features backlog.
- Mark feature dependencies (e.g. to implement fast work with large files we need to implement `indexes` firstly, and 
to implement fast joins we need to implement `indexes` firstly as well).
- Try to make prioritisation of features by `must be`/`have to be` (e.g. `MoSCoW` framework).
- Try to make rough task estimation, just to mark each tasks as `Smal`l/`Medium`/`Extra-Large`/`Extra-Extra-Large`
- Try to estimate risk factor that task will take more resources and rework than we are expecting
- Try to use impact/effort dependency (e.g. `RICE` framework)
And then we will understand how many task we have to do and in what time, and what is the risk factor +/-
