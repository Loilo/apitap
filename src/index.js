import log from '@debugger'

const PROXY_TARGET = Symbol('Proxy target marker')
export const CATCH_ALL = Symbol('Catch-all marker')

/**
 * Checks if a given value is wrappable
 * @param  {any}  value  The value to check
 * @return {boolean}     Whether the value is wrappable
 */
function isWrappable (value) {
  return (typeof value === 'object' || typeof value === 'function') && value !== null
}

/**
 * Call a custom hook on a given injection object
 * @param  {object} target       The original API object
 * @param  {string|symbol} name  The property to call on the injection object
 * @param  {object} injectObj    The injection object
 * @return {any}                 The result of the call
 */
function getInjectedProperty (target, name, injectObj) {
  const desc = Object.getOwnPropertyDescriptor(injectObj, name)

  if (desc && typeof desc.get === 'function') {
    return Reflect.apply(desc.get, target, [])
  } else {
    return Reflect.get(injectObj, name)
  }
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
  if (!isWrappable(api) || Reflect.has(api, PROXY_TARGET)) {
    return api
  }

  log(verbose, 'wrap %o', api)

  const proxy = new Proxy(api, {
    has (target, name) {
      if (name === PROXY_TARGET) return true
      return Reflect.has(target, name)
    },
    construct (target, args) {
      log(verbose, 'construct %o with %o', target, args)

      return wrapApi(Reflect.construct(target, args), inject, null, verbose)
    },
    get (target, name) {
      if (name === PROXY_TARGET) return target

      log(verbose, 'get %o from %o', name, target)

      // If the injected object is a function, create the injection object from that
      const injectObj = (typeof inject === 'function'
        ? inject(target)
        : inject) || Object.create(null)

      // Check if property is shadowed by injection
      const hasInjected = injectObj instanceof Object
        ? injectObj.hasOwnProperty(name)
        : name in injectObj

      // Found property in the injection object
      if (hasInjected) {
        log(verbose, 'property %o shadowed by injected %o', name, injectObj)

        const injectedProperty = getInjectedProperty(target, name, injectObj)

        return wrapApi(injectedProperty, inject, typeof injectedProperty === 'function' ? target : null, verbose)

      // Found property in the original API
      } else if (Reflect.has(target, name)) {
        return wrapApi(Reflect.get(target, name), inject, null, verbose)

      // Didn't find property but have CATCH_ALL
      } else if (injectObj instanceof Object && Reflect.has(injectObj, CATCH_ALL)) {
        log(verbose, 'property %o caught by CATCH_ALL', name)

        const catchAll = Reflect.apply(Reflect.get(injectObj, CATCH_ALL), target, [ name ])

        return wrapApi(catchAll, inject, target, verbose)
      }
    },
    apply (target, thisArg, args) {
      log(verbose, 'call %o with %o as %o', target, args, unwrap(thisArg))

      return wrapApi(Reflect.apply(target, unwrap(thisArg), args), inject, null, verbose)
    }
  })

  return proxy
}

/**
 * Wraps the target API in a Proxy if applicable, returns the value itself if not
 * @param  {any} api          The API to wrap
 * @param  {object} inject    The injected properties
 * @param  {boolean} verbose  If debugging output should be produced
 * @return {any}              The provided API or its wrapping Proxy
 */
export function wrap (api, inject = Object.create(null), verbose = false) {
  return wrapApi(api, inject, null, verbose)
}

/**
 * Unwraps an API previously tapped if applicable, returns the value itself if not
 * @param  {any} api         The API to wrap
 * @param  {object} inject   The injected properties
 * @param  {object} context  The thisArg context applied to methods on the wrapped object
 * @return {any}             The provided API or its wrapping Proxy
 */
export function unwrap (proxy) {
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
export function isWrapped (value) {
  return isWrappable(value) && PROXY_TARGET in value
}
