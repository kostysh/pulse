import createDebugger from 'debug';
import { Pulse } from '.';

const debug = createDebugger('pulse:locklimit');

export type LockLimitMethod = (limit: number) => Pulse;
/**
 * Set the default amount jobs that are allowed to be locked at one time (GLOBAL)
 * @name Pulse#locklimit
 * @function
 * @param limit num Lock limit
 */
export const lockLimit: LockLimitMethod = function (this: Pulse, limit) {
  // @NOTE: Is this different than max concurrency?
  debug('Pulse.lockLimit(%d)', limit);
  this._lockLimit = limit;
  return this;
};
