import debug from 'debug';

const log = (verbose, ...args) => {
  if (verbose) debug('apitap')(...args);
};

const PROXY_TARGET = Symbol('Proxy target marker');

/**
 * Checks if a given value is wrappable
 * @param  {any}  value  The value to check
 * @return {boolean}     Whether the value is wrappable
 */
function isWrappable (value) {
  return (typeof value === 'object' || typeof value === 'function') && value !== null
}

/**
 * Wraps the target API in a Proxy if applicable, returns the value itself if not
 * @param  {any} api          The API to wrap
 * @param  {object} inject    The injected properties
 * @param  {object} context   The thisArg context applied to methods on the wrapped object
 * @param  {boolean} verbose  If debugging output should be produced
 * @return {any}              The provided API or its wrapping Proxy
 */
function wrapApi (api, inject, context, verbose) {
  // If target can't be or is already wrapped, act as an identity function
  if (!isWrappable(api) || PROXY_TARGET in api) {
    return api
  }

  log(verbose, 'wrap %o', api);

  const proxy = new Proxy(api, {
    has (target, name) {
      if (name === PROXY_TARGET) return true
      return Reflect.has(target, name)
    },
    construct (target, args) {
      log(verbose, 'construct %o with %o', target, args);

      return wrapApi(Reflect.construct(target, args), inject, null, verbose)
    },
    get (target, name) {
      if (name === PROXY_TARGET) return target

      log(verbose, 'get %o from %o', name, target);

      // If the injected object is a function, create the injection object from that
      const injectObj = (typeof inject === 'function'
        ? inject(target)
        : inject) || Object.create(null);

      // Check if property is shadowed by injection
      if (injectObj instanceof Object ? injectObj.hasOwnProperty(name) : name in injectObj) {
        log(verbose, 'property %o shadowed by injected %o', name, injectObj);

        const desc = Object.getOwnPropertyDescriptor(injectObj, name);

        let result;
        if (desc && typeof desc.get === 'function') {
          result = desc.get.call(target);
        } else {
          result = injectObj[name];
        }

        return wrapApi(result, inject, typeof result === 'function' ? target : null, verbose)
      } else {
        return wrapApi(Reflect.get(target, name), inject, null, verbose)
      }
    },
    apply (target, thisArg, args) {
      log(verbose, 'call %o with %o as %o', target, args, unwrap(thisArg));

      return wrapApi(Reflect.apply(target, unwrap(thisArg), args), inject, null, verbose)
    }
  });

  return proxy
}

/**
 * Wraps the target API in a Proxy if applicable, returns the value itself if not
 * @param  {any} api          The API to wrap
 * @param  {object} inject    The injected properties
 * @param  {boolean} verbose  If debugging output should be produced
 * @return {any}              The provided API or its wrapping Proxy
 */
function wrap (api, inject = Object.create(null), verbose = false) {
  return wrapApi(api, inject, null, verbose)
}

/**
 * Unwraps an API previously tapped if applicable, returns the value itself if not
 * @param  {any} api         The API to wrap
 * @param  {object} inject   The injected properties
 * @param  {object} context  The thisArg context applied to methods on the wrapped object
 * @return {any}             The provided API or its wrapping Proxy
 */
function unwrap (proxy) {
  if (isWrapped(proxy)) {
    return proxy[PROXY_TARGET]
  } else {
    return proxy
  }
}

/**
 * Checks if a value is wrapped
 * @param  {any}  value  The value to check
 * @return {boolean}     Whether the value is wrapped
 */
function isWrapped (value) {
  return isWrappable(value) && PROXY_TARGET in value
}

export { wrap, unwrap, isWrapped };
