const { unwrap, wrap, isWrapped } = require('../dist/node.cjs')

test('recognizes non-wrapped primitives', () => {
  expect(isWrapped(1)).toBe(false)
  expect(isWrapped(true)).toBe(false)
  expect(isWrapped('string')).toBe(false)
  expect(isWrapped(Symbol())).toBe(false)
})

test('recognizes wrapped values', () => {
  expect(isWrapped(wrap({}))).toBe(true)
  expect(isWrapped(wrap(function () {}))).toBe(true)
  expect(isWrapped(wrap(class Foo {}))).toBe(true)
})

test('recognizes unwrapped values', () => {
  expect(isWrapped(unwrap(wrap({})))).toBe(false)
  expect(isWrapped(unwrap(wrap(function () {})))).toBe(false)
  expect(isWrapped(unwrap(wrap(class Foo {})))).toBe(false)
})
