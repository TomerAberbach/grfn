import test from 'ava'
import { grfn } from './index.js'

function a() {}
function b() {}
function c() {}
function d() {}
function e() {}

test(`throws on non-fn`, t => {
  t.throws(() => grfn(['hi']), { instanceOf: TypeError })
})

test(`throws on zero vertices`, t => {
  t.throws(() => grfn([]), {
    instanceOf: Error,
    message: `expected 1 output fn: 0`
  })
})

test(`throws on cycle`, t => {
  t.throws(
    () =>
      grfn([
        [c, [d]],
        [a, [b, c, d]],
        [b, [c]],
        [d, [b, e]],
        [e, [c]]
      ]),
    {
      instanceOf: Error,
      message: `expected acyclic: c <- d <- e <- c`
    }
  )
})

test(`throws on unknown fn`, t => {
  t.throws(
    () => grfn([[c, [d]]]),
    {
      instanceOf: Error,
      message: `expected known fn: d`
    }
  )
})

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

test(`works`, async t => {
  const values = []

  async function a(x, y) {
    values.push(['a', x, y])
    await delay(2)
    return x + y
  }

  async function b(x, y) {
    await delay(4)
    values.push(['b', x, y])
    return 2 * x + 3 * y
  }

  async function c(x) {
    values.push(['c', x])
    await delay(3)
    return x * 2
  }

  async function d(x, y, z) {
    values.push(['d', x, y, z])
    await delay(1)
    return x + y + z
  }

  async function e(x) {
    values.push(['e', x])
    await delay(1)
    return x * 2
  }

  const fn = grfn([
    [d, [a, c, e]],
    [c, [b]],
    b,
    [e, [a]],
    a
  ])
  const result = await fn(1, 2)

  t.deepEqual(values, [
    ['a', 1, 2], ['e', 3], ['b', 1, 2], ['c', 8], ['d', 3, 16, 6]
  ])
  t.is(result, 25)
})
