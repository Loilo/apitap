const { wrap, unwrap, isWrapped, CATCH_ALL } = require('../dist/node.cjs')

const api = {
  foo () {
    return 'bar'
  }
}

test('injects additional properties', () => {
  const wrappedApi = wrap(api, {
    bar () {
      return 'baz'
    }
  })

  expect(wrappedApi.foo()).toBe('bar')
  expect(wrappedApi.bar()).toBe('baz')
})

test('uses CATCH_ALL (only) if property is not available', () => {
  const wrappedApi = wrap(api, {
    [CATCH_ALL] (name) {
      return () => [ name, this ]
    }
  })

  expect(wrappedApi.foo()).toBe('bar')
  expect(wrappedApi.bar()[0]).toBe('bar')
  expect(unwrap(wrappedApi.bar()[1])).toBe(api)
})

test('shadows existing properties', () => {
  const wrappedApi = wrap(api, {
    foo () {
      return 'baz'
    }
  })

  expect(wrappedApi.foo()).toBe('baz')
})

test('ignores injection\'s prototypal properties', () => {
  class Injection {
    bar () {
      return 'baz'
    }
  }

  const wrappedApi = wrap(api, new Injection())

  expect(() => wrappedApi.bar()).toThrow(TypeError)
})

test('injects getters', () => {
  const wrappedApi = wrap(api, {
    get bar () {
      return 'baz'
    }
  })

  expect(wrappedApi.bar).toBe('baz')
})

test('provides correct `this` value', () => {
  const wrappedApi = wrap(api, {
    bar () {
      return this
    },
    get baz () {
      return this
    }
  })

  expect(unwrap(wrappedApi.bar())).toBe(api)
  expect(unwrap(wrappedApi.baz)).toBe(api)
})

test('takes an injection function', () => {
  const wrappedApi = wrap(api, target => {
    if (typeof target === 'function') {
      return { funcProp: 'available' }
    } else {
      return { objProp: 'available' }
    }
  })

  expect(wrappedApi.funcProp).not.toBeDefined()
  expect(wrappedApi.objProp).toBe('available')

  expect(wrappedApi.foo.funcProp).toBe('available')
  expect(wrappedApi.foo.objProp).not.toBeDefined()
})

test('wraps injected results', () => {
  const wrappedApi = wrap(api, {
    bar: []
  })

  expect(isWrapped(wrappedApi.bar)).toBe(true)
})
