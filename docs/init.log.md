## Environment: ##
```shell
node -v
```
`v20.18.1`

```shell
npm -v
```
`10.8.2`

IDE: WebStorm  
WebStorm setting `File | Settings | Editor | Code Style` : `Line Separator` set to `LF` (`\n Unix and MacOS`)

## Init `tsconfig` and empty project: ##
```shell
npm init -y
npm i -D typescript @type/node @tsconfig/node20 rimraf

mkdir src
touch ./src/index.ts

touch tsconfig.json
```

According [docs](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 
we can use `@tsconfig/node22/tsconfig` and add next strings to `tsconfig.json`:
```json
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "forceConsistentCasingInFileNames": true,
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Add next strings to `package.json` to `scripts` section:
```json
    "build": "tsc",
    "clean": "rimraf ./dist",
    "start": "node ./dist/index.js"
```

## Init `jest`: ##
```shell
npm i -D jest ts-jest @type/jest
touch jest.config.js

mkdir tests
touch ./tests/tsconfig.json
```

Add next strings to `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest', // Use ts-jest preset for testing TypeScript files with Jest
  testEnvironment: 'node', // Set the test environment to Node.js
  roots: ['<rootDir>/tests'], // Define the root directory for tests and modules
  transform: {
    // Use ts-jest to transform TypeScript files
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '((\\.|/)(test|spec))\\.tsx?$', // Regular expression to find test files
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // File extensions to recognize in module resolution
};
```

Add next strings to `tsconfig.json`
```javascript
{
  "compilerOptions": {
    "extends": "@tsconfig/node22/tsconfig.json"
  }
}
```

Add next strings to `package.json` to `scripts` section:
```json
    "test": "jest",
    "test:watch": "jest --watch"
```

## Init `ESLint` and `prettier`: ##
```shell
npm init @eslint/config@latest
```
Output:  
✔. How would you like to use ESLint? · `problems`  
✔. What type of modules does your project use? · `commonjs`  
✔ Which framework does your project use? · `none`  
✔ Does your project use TypeScript? · `typescript`  
✔ Where does your code run? · `node`  

In file `eslint.config.mjs` update `files`, add `ignores` (`node_modules` is ignored by default) and `rules`:
```javascript
  {ignores: ["dist/"]},
  {files: ["src/**/*.{js,ts,jsx,tsx}", "tests/**/*.{js,ts,jsx,tsx}"]},
  {
    rules: {},
  },
```

```shell
npm i -D eslint-plugin-prettier eslint-config-prettier
npm i -D -E prettier
````

Add next strings to file `eslint.config.mjs` add :
```javascript
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
```

Add next strings to file `eslint.config.mjs` (into `export default[...]`):
```javascript
  eslintPluginPrettierRecommended,
```

Note: Also possible to install prettier separately INSTEAD the plugin and add just style conflict resolve to
`eslint` using `eslint-config-prettier` (mode detail [here](https://prettier.io/docs/en/integrating-with-linters)),
just need to import `import eslintConfigPrettier from "eslint-config-prettier";`
and add `eslintConfigPrettier` into `export default [...]`  

```shell
touch .prettierrc
```

Add next strings to file `.prettierrc`:
```json
{
  "singleQuote": true,
  "printWidth": 120
}
```

Add next strings to file `package.json` to `scripts` section:
```json
    "lint": "eslint",
    "lint-fix": "eslint --fix"
```

Possible run `npm run lint-fix eslint.config.mjs` to fix "singleQuote" there
```shell
npm run lint-fix eslint.config.mjs
```

Check that `ESLint` plugin installed in IDE (WebStorm: `Plugins sections`) and `ESLint` is
enabled (WebStorm: `File | Settings | Languages & Frameworks | JavaScript | Code Quality Tools | ESLint`).  
Choose manual `ESLint` configuration, select installed module and `eslint.config.mjs`

Check that prettier plugin installed in IDE (WebStorm: `Plugins sections`) and `prettier` is
enabled (WebStorm: `File | Settings | Languages & Frameworks | JavaScript | Prettier`)

## Init `ESLint` `jest` plugin: ##
This step has to be passed if step `"Init jest"` was passed
```shell
npm i -D eslint-plugin-jest
```
Add next strings to file `eslint.config.mjs` add :
```javascript
import jest from 'eslint-plugin-jest';
```

Add next strings to file `eslint.config.mjs` (into `export default[...]`):
```javascript
  {
    files: ['tests/**/*.{js,ts,jsx,tsx}'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
```

## Init env: ##
```shell
npm i -D dotenv
```
If a will need to change environments - possible to use `dotenv-cli` instead `dotenv`

```shell
touch .env
touch .env.example
```

## Init `nodemon`: ##
```shell
npm i -D ts-node nodemondotenv nodemon
touch nodemon.json
```
Elso possible to use e.g. `tsx` instead `ts-node`

Add next strings to file `nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "js,ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node ./src/index.ts"
}
```

Add next strings to file `package.json` to `scripts` section:
```json
    "dev": "nodemon",
```

## Init husky: ##
It can be used to run some hooks locally, to not run jobs on `github`/`gitlab` 
```shell
npm i -D husky
```
Add next strings to file `package.json` to main section:
```json
"huskey": {
  "hook": {
    "pre-commit": "npm run lint"
  }
},
```

## Init other modules: ##
npm i csv-parse log4js 
