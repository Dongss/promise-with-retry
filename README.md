# promise-with-retry

[![Build Status](https://travis-ci.org/Dongss/promise-with-retry.svg?branch=master)](https://travis-ci.org/Dongss/promise-with-retry)
[![Coverage Status](https://coveralls.io/repos/github/Dongss/promise-with-retry/badge.svg?branch=master)](https://coveralls.io/github/Dongss/promise-with-retry?branch=master)
[![Dependency Status](https://dependencyci.com/github/Dongss/promise-with-retry/badge)](https://dependencyci.com/github/Dongss/promise-with-retry)

Easily retry operations with any retry strategy you want.

Support async functions or functions returned Promise.

## Intall

`npm install promise-with-retry --save`

## Usage

```
const RetryOp = require('promise-with-retry').default;

function promiseOperation(...args) {
    return new Promise((resolve: any, reject: any) => {
        // ...
    });
}

async function asyncOperation(...args) {
    // ...
}

let myOp = RetryOp.buildOperation(promiseOperation);
// or async function:
// let myOp = RetryOp.buildOperation(asyncOperation);

let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
    if (retryOptions.returns.error) {
        // retry after 5000ms
        return 5000; 
    }
    // finish
    return;
});
```

## Events

### op_resolve

`op` is resolved

```
myRetry.on('op_resolve', (retryOptions, data) => {
});
```

* `data`: value `op` resolved

### op_reject

`op` is rejected

```
myRetry.on('op_reject', (retryOptions, error) => {
});
```

* `error`: error `op` rejected

### retry

event before `op` is executed

```
myRetry.on('retry', (retryOptions) => {
});

```

### finish

`op` has stop retry

```
myRetry.on('finish', (retryOptions) => {
});
```

## API

### RetryOp.buildOperation(fn)

* `fn`: `async` function or function returned `Promise`

### new RetryOp(op, retryStrategy)

* `op`: value returned by RetryOp.buildOperation(fn)
* `retryStrategy`: (retryOptions) => {} return a number (ms) as timeout, the retry will happen exactly after that time in milliseconds. if return is not number, will not retry.

`retryOptions`: 

* `startTime`: number,  ms
* `totalRetryCount`: number
* `returns`: return of `op`: 
    * error: error `op` rejected
    * data: value `op` resolved

## Example

typescript example:

```
import RetryOp from 'promise-with-retry';

async function asyncOperation(ms: number) {
    // ...
}

let myAsyncOp = RetryOp.buildOperation(asyncOperation);
let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
    if (retryOptions.totalRetryCount < 3) {
        // will retry after 500ms
        return 500;
    }
    // stop retry
    return;
});

myRetry.on('finish', (retryOptions) => {
});

```

## Test

`npm tet` 