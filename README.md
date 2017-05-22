# promise-with-retry

[![Build Status](https://travis-ci.org/Dongss/promise-with-retry.svg?branch=master)](https://travis-ci.org/Dongss/promise-with-retry)
[![Coverage Status](https://coveralls.io/repos/github/Dongss/promise-with-retry/badge.svg?branch=master)](https://coveralls.io/github/Dongss/promise-with-retry?branch=master)

Easily retry function that returns a `Promise`, and it's synchronous execution.

## Install

`npm install promise-with-retry --save`

## Usage

`promiseWithRetry(...args)(f, opt)`

* ...args, args of function `f`
* f, function that return `Promise`
* opt, retry options
    * interval?: number; // ms
    * maxCount?: number;
    * maxTime?: number; // max total time. seconds
    * base?: number;
    * mode?: 'EXPONET' | 'CONST';

default opt:

* interval: 2000, // 2s
* maxCount: 5, // max execute count
* base: 2,
* mode: 'EXPONET',

return:

* count: number;
* result: any;

error return:

* array of error rejected by `f`

## Example

```
var rPromise = require('promise-with-retry');

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(1024);
        }, ms);
    });
}

rPromise.promiseWithRetry(1000)(sleep)
.then(v => {
    // { count: 1, result: 1024 }
    console.log(v);
})
.catch(e => {
    console.log(e);
});
```

typescript usage:

```
import * as rPromise from 'promise-with-retry';

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1024);
    }, ms);
  });
}

async function main() {
    try {
        let result = await rPromise.promiseWithRetry(100)(sleep);
        console.log(result);
    } catch (e) {
        console.log(e)
    }
}

await main();  // { count: 1, result: 1024 }
```

## test

`npm test`