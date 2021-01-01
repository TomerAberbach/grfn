/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'ava'
import { grfn } from './src/index.js'
import './src/debug.js'

/* eslint-disable no-empty-function */
function a() {}
function b() {}
function c() {}
function d() {}
function e() {}
/* eslint-enable no-empty-function */

test(`throws on non-fn`, t => {
  t.throws(() => grfn([`hi`]), { instanceOf: TypeError })
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
  t.throws(() => grfn([[c, [d]]]), {
    instanceOf: Error,
    message: `expected known fn: d`
  })
})

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

test(`works`, async t => {
  const values = []

  async function l(x, y) {
    values.push([`l`, x, y])
    await delay(2)
    return x + y
  }

  async function m(x, y) {
    await delay(4)
    values.push([`m`, x, y])
    return 2 * x + 3 * y
  }

  async function n(x) {
    values.push([`n`, x])
    await delay(3)
    return x * 2
  }

  async function o(x, y, z) {
    values.push([`o`, x, y, z])
    await delay(1)
    return x + y + z
  }

  async function p(x) {
    values.push([`p`, x])
    await delay(1)
    return x * 2
  }

  const fn = grfn([[o, [l, n, p]], [n, [m]], m, [p, [l]], l])
  const result = await fn(1, 2)

  t.deepEqual(values, [
    [`l`, 1, 2],
    [`p`, 3],
    [`m`, 1, 2],
    [`n`, 8],
    [`o`, 3, 16, 6]
  ])
  t.is(result, 25)
})
