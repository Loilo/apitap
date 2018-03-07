const { wrap, unwrap, isWrapped } = require('../dist/node.cjs')

const symbol = Symbol()

function returnsArg (arg) {
  return arg
}

class ClassApi {}

const objectApi = {
  number: 1,
  boolean: true,
  string: 'string',
  symbol,

  returnsNumber () {
    return 1
  },
  returnsBoolean () {
    return true
  },
  returnsString () {
    return 'string'
  },
  returnsSymbol () {
    return symbol
  },

  returnsObject () {
    return objectApi
  },
  returnsFunction () {
    return returnsArg
  },
  returnsClass () {
    return ClassApi
  },
  returnsArgs (...args) {
    return args
  },
  returnsThis () {
    return this
  }
}

test('does not wrap functions\' primitive return values', () => {
  const wrappedFn = wrap(returnsArg)
  expect(isWrapped(wrappedFn(0))).toBe(false)
  expect(isWrapped(wrappedFn(true))).toBe(false)
  expect(isWrapped(wrappedFn('string'))).toBe(false)
  expect(isWrapped(wrappedFn(Symbol()))).toBe(false)
})

test('wraps functions\' non-primitive return values', () => {
  const wrappedFn = wrap(returnsArg)
  expect(isWrapped(wrappedFn({}))).toBe(true)
  expect(isWrapped(wrappedFn(function () {}))).toBe(true)
})

test('returns correct values from wrapped functions', () => {
  const numbers = [ 1, 2, 3 ]
  const rawResult = returnsArg(numbers)
  const wrappedResult = wrap(returnsArg)(numbers)

  expect(rawResult).toBe(numbers)
  expect(wrappedResult).toEqual(numbers)
  expect(unwrap(wrappedResult)).toBe(rawResult)
})

test('does not wrap primitive object properties', () => {
  const wrappedObjectApi = wrap(objectApi)

  expect(wrappedObjectApi.number).toBe(1)
  expect(wrappedObjectApi.boolean).toBe(true)
  expect(wrappedObjectApi.string).toBe('string')
  expect(wrappedObjectApi.symbol).toBe(symbol)
})

test('does not wrap object methods\' primitive return values', () => {
  const wrappedObjectApi = wrap(objectApi)

  expect(wrappedObjectApi.returnsNumber()).toBe(1)
  expect(wrappedObjectApi.returnsBoolean()).toBe(true)
  expect(wrappedObjectApi.returnsString()).toBe('string')
  expect(wrappedObjectApi.returnsSymbol()).toBe(symbol)
})

test('wraps non-primitive object properties', () => {
  const wrappedObjectApi = wrap(objectApi)

  expect(isWrapped(wrappedObjectApi.returnsObject())).toBe(true)
  expect(isWrapped(wrappedObjectApi.returnsFunction())).toBe(true)
  expect(isWrapped(wrappedObjectApi.returnsClass())).toBe(true)
  expect(isWrapped(wrappedObjectApi.returnsArgs())).toBe(true)
  expect(isWrapped(wrappedObjectApi.returnsThis())).toBe(true)
})

test('returns correct `this` from object method', () => {
  const wrappedObjectApi = wrap(objectApi)
  expect(unwrap(wrappedObjectApi.returnsThis())).toBe(objectApi)
})

test('can construct wrapped class instances', () => {
  const wrappedClass = wrap(ClassApi)
  expect(Reflect.construct(wrappedClass, [])).toBeInstanceOf(ClassApi)
  expect(isWrapped(Reflect.construct(wrappedClass, []))).toBe(true)
})
