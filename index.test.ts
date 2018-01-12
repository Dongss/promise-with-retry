import * as assert from 'assert';
import test from 'ava';
import * as sinon from 'sinon';
import RetryOp from './index';

function promiseOperation(a: any) {
    return new Promise((resolve: any, reject: any) => {
        resolve({a: a});
    });
}

function sleep(ms: number, fail?: boolean) {
    return new Promise((resolve: any, reject: any) => {
        if (!fail) {
            setTimeout(() => {
                resolve(ms);
            }, ms);
        } else {
            setTimeout(() => {
                reject(ms);
            }, ms);
        }
    });
}

async function asyncOperation(ms: number, fail?: boolean) {
    await sleep(ms, fail);
    return ms;
}

test('build operation with promise function', async t => {
    let myPromiseOp = RetryOp.buildOperation(promiseOperation);
    t.is('function', typeof myPromiseOp);
    let closureF = myPromiseOp(123456);
    t.is('function', typeof closureF);
    let r = await closureF();
    t.deepEqual(r, {a: 123456});
    t.pass();
});

test('build operation with async function', async t => {
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    t.is('function', typeof myAsyncOp);
    let closureF = myAsyncOp(1000);
    t.is('function', typeof closureF);
    let r = await closureF();
    t.deepEqual(1000, r);
    t.pass();
});

test('resolve events', async t => {
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let spy1 = sinon.spy();
    let spy2 = sinon.spy();
    let spy3 = sinon.spy();
    let spy5 = sinon.spy();
    let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
        return;
    });
    myRetry.on('op_resolve', spy1);
    myRetry.on('op_reject', spy2);
    myRetry.on('retry', spy3);
    myRetry.on('finish', spy5);

    await sleep(2000);
    assert(spy1.calledOnce);
    assert(spy2.notCalled);
    assert(spy3.notCalled);
    assert(spy5.calledOnce);
    t.pass();
});

test('reject events', async t => {
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let spy1 = sinon.spy();
    let spy2 = sinon.spy();
    let spy3 = sinon.spy();
    let spy5 = sinon.spy();
    let myRetry = new RetryOp(myAsyncOp(500, true), (retryOptions) => {
        return;
    });
    myRetry.on('op_resolve', spy1);
    myRetry.on('op_reject', spy2);
    myRetry.on('retry', spy3);
    myRetry.on('finish', spy5);

    await sleep(2000);
    assert(spy1.notCalled);
    assert(spy2.calledOnce);
    assert(spy3.notCalled);
    assert(spy5.calledOnce);
    t.pass();
});

test('resolve returns', async t => {
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
        t.is(500, retryOptions.returns.data);
        t.is(null, retryOptions.returns.error);
        return;
    });
    await sleep(2000);
});

test('reject returns', async t => {
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let myRetry = new RetryOp(myAsyncOp(500, true), (retryOptions) => {
        t.is(500, retryOptions.returns.error);
        t.is(null, retryOptions.returns.data);
        return;
    });
    await sleep(2000);
});

test('retryOptions limit by count', async t => {
    let spy1 = sinon.spy();
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
        if (retryOptions.totalRetryCount < 3) {
            return 200;
        }
        t.is(3, retryOptions.totalRetryCount);
        return;
    });
    myRetry.on('retry', spy1);
    await sleep(3000);
    assert(spy1.calledThrice);
});

test('retryOptions limit by time', async t => {
    let spy1 = sinon.spy();
    let myAsyncOp = RetryOp.buildOperation(asyncOperation);
    let myRetry = new RetryOp(myAsyncOp(500), (retryOptions) => {
        let now = Date.now();
        if (now - retryOptions.startTime < 2700) {
            return 500;
        }
        t.is(3, retryOptions.totalRetryCount);
        return;
    });
    myRetry.on('retry', spy1);
    await sleep(4500);
    assert(spy1.calledThrice);
});

test('op should be function', async t => {
    const error = t.throws(() => {
        let myRetry = new RetryOp(('not function') as any, (retryOptions) => {
            return;
        });
    }, Error);
    t.is(error.message, 'Operation must be a function');
});