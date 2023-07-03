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
import grfn from '../../src/index.js'

const delay = (timeout: number) =>
  new Promise(resolve => setTimeout(resolve, timeout))

export const works = async (): Promise<void> => {
  const values: unknown[] = []

  async function l(x: number, y: number) {
    values.push([`l`, x, y])
    await delay(2)
    return x + y
  }

  async function m(x: number, y: number) {
    await delay(4)
    values.push([`m`, x, y])
    return 2 * x + 3 * y
  }

  async function n(x: number) {
    values.push([`n`, x])
    await delay(3)
    return x * 2
  }

  async function o(x: number, y: number, z: number) {
    values.push([`o`, x, y, z])
    await delay(1)
    return x + y + z
  }

  async function p(x: number) {
    values.push([`p`, x])
    await delay(1)
    return x * 2
  }

  const fn = grfn<[number, number], number>([
    [o, [l, n, p]],
    [n, [m]],
    m,
    [p, [l]],
    l,
  ])
  const result = await fn(1, 2)

  expect(values).toStrictEqual([
    [`l`, 1, 2],
    [`p`, 3],
    [`m`, 1, 2],
    [`n`, 8],
    [`o`, 3, 16, 6],
  ])
  expect(result).toBe(25)
}
