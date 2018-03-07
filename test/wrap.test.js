const { wrap, isWrapped } = require('../dist/node.cjs')

test('does not wrap primitives', () => {
  expect(wrap(1)).toBe(1)
  expect(wrap(true)).toBe(true)
  expect(wrap('string')).toBe('string')

  const symbol = Symbol()
  expect(wrap(symbol)).toBe(symbol)
})

test('wraps plain objects', () => {
  expect(wrap({ foo: 'bar' })).toEqual({ foo: 'bar' })
})

test('wraps functions', () => {
  expect(isWrapped(wrap(function () {}))).toBe(true)
})

test('wraps classes', () => {
  expect(isWrapped(wrap(class Foo {}))).toBe(true)
})

test('wraps idempotently', () => {
  const wrapped = wrap({})
  expect(wrap(wrapped)).toBe(wrapped)
})
