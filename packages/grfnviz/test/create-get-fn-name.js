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

import { testProp, fc } from 'ava-fast-check'
import test from 'ava'
import createGetFnName from '../src/create-get-fn-name.js'

const withName = (fn, name) =>
  Object.defineProperty(fn, `name`, {
    enumerable: false,
    writable: false,
    value: name
  })

const fnArb = ({ nameArb = fc.string() } = {}) =>
  fc
    .tuple(fc.func(fc.anything()), nameArb)
    .map(([fn, name]) => withName(fn, name))

testProp(
  `getFnName returns the same name for the same function`,
  [fc.array(fnArb())],
  (t, fns) => {
    const getFnName = createGetFnName()

    const namesFirst = fns.map(getFnName)
    const namesSecond = fns.map(getFnName)

    t.deepEqual(namesFirst, namesSecond)
  }
)

testProp(
  `getFnName returns a string starting with 'unnamed' for unnamed functions`,
  [
    fc.array(
      fnArb({
        nameArb: fc.constantFrom(undefined, null, ``)
      }),
      { minLength: 1 }
    )
  ],
  (t, fns) => {
    const getFnName = createGetFnName()

    for (const fn of fns) {
      t.true(getFnName(fn).startsWith(`unnamed`))
    }
  }
)

testProp(
  `getFnName returns a string with an incremented count for duplicate function names`,
  [
    fc.string({ minLength: 1 }),
    fc.array(fc.func(fc.anything()), { minLength: 5, maxLength: 5 })
  ],
  (t, name, fns) => {
    const [fn0, fn1, fn2, fn3, fn4] = fns.map(fn => withName(fn, name))
    const getFnName = createGetFnName()

    t.is(getFnName(fn0), name)
    t.is(getFnName(fn1), `${name} (1)`)
    t.is(getFnName(fn2), `${name} (2)`)
    t.is(getFnName(fn3), `${name} (3)`)
    t.is(getFnName(fn4), `${name} (4)`)
  }
)

/* eslint-disable no-empty-function */
test(`getFnName concrete example`, t => {
  const getFnName = createGetFnName()

  function x() {}
  const x2 = withName(() => {}, `x`)
  function y() {}

  t.is(getFnName(x), `x`)
  t.is(getFnName(x2), `x (1)`)
  t.is(getFnName(y), `y`)
})
/* eslint-enable no-empty-function */
