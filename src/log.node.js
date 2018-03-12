import debug from 'debug'
const log = debug('apitap')

/**
 * Debugging log for Node.js
 */
export default (_, ...args) => log(...args)
