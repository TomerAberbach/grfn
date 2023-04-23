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

/* eslint-disable no-restricted-syntax */

import { fc, testProp } from 'tomer'
import createGetFnName from '../src/create-get-fn-name.js'

const withName = (
  fn: (...args: unknown[]) => unknown,
  name: string | undefined | null,
) =>
  Object.defineProperty(fn, `name`, {
    enumerable: false,
    writable: false,
    value: name,
  })

const fnArb = ({
  nameArb = fc.string(),
}: { nameArb?: fc.Arbitrary<string | undefined | null> } = {}) =>
  fc
    .tuple(fc.func(fc.anything()), nameArb)
    .map(([fn, name]) => withName(fn, name))

testProp(
  `getFnName returns the same name for the same function`,
  [fc.array(fnArb())],
  fns => {
    const getFnName = createGetFnName()

    const namesFirst = fns.map(getFnName)
    const namesSecond = fns.map(getFnName)

    expect(namesFirst).toStrictEqual(namesSecond)
  },
)

testProp(
  `getFnName returns a string starting with 'unnamed' for unnamed functions`,
  [
    fc.array(
      fnArb({
        nameArb: fc.constantFrom(undefined, null, ``),
      }),
      { minLength: 1 },
    ),
  ],
  fns => {
    const getFnName = createGetFnName()

    for (const fn of fns) {
      expect(getFnName(fn)).toStartWith(`unnamed`)
    }
  },
)

testProp(
  `getFnName returns a string with an incremented count for duplicate function names`,
  [
    fc.string({ minLength: 1 }),
    fc.array(fc.func(fc.anything()), { minLength: 5, maxLength: 5 }),
  ],
  (name, fns) => {
    const [fn0, fn1, fn2, fn3, fn4] = fns.map(fn => withName(fn, name))
    const getFnName = createGetFnName()

    expect(getFnName(fn0)).toBe(name)
    expect(getFnName(fn1)).toBe(`${name} (1)`)
    expect(getFnName(fn2)).toBe(`${name} (2)`)
    expect(getFnName(fn3)).toBe(`${name} (3)`)
    expect(getFnName(fn4)).toBe(`${name} (4)`)
  },
)

/* eslint-disable typescript/no-empty-function */
function x() {}
function y() {}

test(`getFnName concrete example`, () => {
  const getFnName = createGetFnName()

  const x2 = withName(() => {}, `x`)

  expect(getFnName(x)).toBe(`x`)
  expect(getFnName(x2)).toBe(`x (1)`)
  expect(getFnName(y)).toBe(`y`)
})
/* eslint-enable typescript/no-empty-function */
