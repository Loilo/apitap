const { unwrap, wrap, isWrapped } = require('../dist/node.cjs')

test('acts as identity for non-wrapped values', () => {
  expect(unwrap(1)).toBe(1)
  expect(unwrap(true)).toBe(true)
  expect(unwrap('string')).toBe('string')
  const obj = {}
  const fn = function () {}
  expect(unwrap(obj)).toBe(obj)
  expect(unwrap(fn)).toBe(fn)
})

test('unwraps plain objects', () => {
  const obj = { foo: 'bar' }
  expect(unwrap(wrap(obj))).toBe(obj)
})

test('unwraps functions', () => {
  const fn = function () {}
  expect(unwrap(wrap(fn))).toBe(fn)
})

test('unwraps classes', () => {
  class Foo {}
  expect(unwrap(wrap(Foo))).toBe(Foo)
})

test('unwraps idempotently', () => {
  const obj = {}
  expect(unwrap(unwrap(obj))).toBe(obj)
  expect(unwrap(unwrap(wrap(obj)))).toBe(obj)
})
