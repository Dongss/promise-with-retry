import test from 'ava';
import * as rPromise from './index';

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1024);
    }, ms);
  });
}

function sleepFail(ms: number) {
  return new Promise((resolve, reject) => setTimeout(reject, ms));
}

test('should throw if param f is not a function', async (t: any) => {
  let error = await t.throws(rPromise.promiseWithRetry()((1 as any)));
  t.is(error.message, 'param [f] must be a function');
});

test('execute all fail with default option', async (t: any) => {
  let error = await t.throws(rPromise.promiseWithRetry(50)(sleepFail));
  t.is(error.length, 5);
});

test('execute all fail with default max count 2', async (t: any) => {
  let error = await t.throws(rPromise.promiseWithRetry(50)(sleepFail, {
    interval: 1000,
    maxCount: 2
  }));
  t.is(error.length, 2);
});

test('success with default option', async (t: any) => {
  let result = await rPromise.promiseWithRetry(100)(sleep);
  t.deepEqual(result, {
    count: 1,
    result: 1024
  });
});

test('time limit should work', async (t: any) => {
  let error = await t.throws(rPromise.promiseWithRetry(5000)(sleepFail, {
    interval: 100,
    maxCount: 3,
    maxTime: 1,
    mode: 'CONST'
  }));
  t.deepEqual(error, [ undefined ]);
});