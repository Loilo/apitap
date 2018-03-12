/**
 * Debugging log for browsers. The `debug` module would be too heavy-weighted to use here
 */
export default (verbose, ...args) => {
  if (verbose) console.log(...typeof args[0] === 'string' ? [ `[apitap] ${args[0]}`, ...args.slice(1) ] : args)
}
