import * as events from 'events';

enum RetryEvents {
    OP_DONE = 'op_resolve',
    OP_ERROR = 'op_reject',
    RETREY = 'retry',
    FINISH = 'finish',
}

export type Operation = (...args: any[]) => any;

export interface RetryOptions {
    startTime: number; // ms
    totalRetryCount: number;
    returns: {
        error: any;
        data?: any;
    };
}

export type RetryStrategy = (option: RetryOptions) => any;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class RetryOp extends events.EventEmitter {
    private op: Operation = null;
    private retryOptions: RetryOptions;
    private retryStrategy: RetryStrategy;
    constructor(op: Operation, retryStrategy: RetryStrategy) {
        super();
        this.op = op;
        this.retryStrategy = retryStrategy;
        this.retryOptions = {
            startTime: Date.now(),
            totalRetryCount: 0,
            returns: {
                error: null
            }
        };
        this.run();
    }
    static buildOperation(fn: Operation) {
        return function(...args: any[]) {
            return function() {
                return fn.apply(fn, args);
            };
        };
    }
    private run() {
        if (!this.op || typeof this.op !== 'function') {
            throw new Error('Operation must be a function');
        }
        this.op().then((...args: any[]) => {
            this.onResolve.apply(this, args);
        }).catch((e: any) => {
            this.onReject.call(this, e);
        });
    }
    private onResolve(...args: any[]) {
        this.retryOptions.returns.error = null;
        this.retryOptions.returns.data = args[0];
        this.emit(RetryEvents.OP_DONE, this.retryOptions, args[0]);
        this.onceDone();
    }
    private onReject(error: any) {
        this.retryOptions.returns.error = error;
        this.retryOptions.returns.data = null;
        this.emit(RetryEvents.OP_ERROR, this.retryOptions, error);
        this.onceDone();
    }
    private async retry(timeout: number) {
        this.retryOptions.totalRetryCount++;
        await sleep(timeout);
        this.emit(RetryEvents.RETREY, this.retryOptions);
        this.run();
    }
    private onceDone() {
        let timeout = this.retryStrategy(this.retryOptions);
        if (typeof timeout === 'number') {
            this.retry(timeout);
        } else {
            this.emit(RetryEvents.FINISH, this.retryOptions);
        }
    }
}