export interface PRetryOpt {
  interval?: number; // ms
  maxCount?: number;
  maxTime?: number; // max total time. seconds
  base?: number;
  mode?: 'EXPONET' | 'CONST';
}

export interface PRetryResult {
  count: number;
  result: any;
}

export const defaultRetryOpt: PRetryOpt = {
  interval: 2000, // 2s
  maxCount: 5, // max execute count
  base: 2,
  mode: 'EXPONET',
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * build promise with retry
 * synchronous execution
 *
 * @export
 * @param {...any[]} args, arguments of function f()
 * @returns {(f: (...p: any[]) => Promise<any>, opt?: PRetryOpt) => Promise<PRetryResult>}
 */
export function promiseWithRetry(...args: any[])
: (f: (...p: any[]) => Promise<any>, opt?: PRetryOpt) => Promise<PRetryResult> {
  let ctx = this;
  let count: number = 1;
  let fe: any[] = [];
  let startTime = Math.floor(Date.now() / 1000);

  return async function(f: (...p: any[]) => Promise<any>, opt?: PRetryOpt): Promise<PRetryResult> {
    if (typeof f !== 'function') {
      throw new Error('param [f] must be a function');
    }
    let _opt: PRetryOpt = Object.assign(defaultRetryOpt, opt);

    while (count <= _opt.maxCount && (_opt.maxTime ? (Math.floor(Date.now() / 1000) <= startTime) : true)) {
      try {
        let result: any = await f.apply(ctx, args);
        return {
          count: count,
          result: result
        };
      } catch (e) {
        fe.push(e);
        await sleep(_opt.mode === 'CONST' ? _opt.interval : _opt.interval * Math.pow(_opt.base, count - 1));
        count ++;
      }
    }

    return Promise.reject(fe);
  };
}
