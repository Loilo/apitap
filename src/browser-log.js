/**
 * Debugging log for browsers. The `debug` module would be too heavy-weighted to use here
 */
export default name => (...args) => console.log(...typeof args[0] === 'string' ? [ `[${name}] ${args[0]}`, ...args.slice(1) ] : args)
