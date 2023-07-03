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
import '../src/debug.js'
import grfn, { type Fn } from '../src/index.js'
import { works } from './helpers/index.js'

/* eslint-disable typescript/no-empty-function */
function a() {}
function b() {}
function c() {}
function d() {}
function e() {}
/* eslint-enable typescript/no-empty-function */

test(`throws on non-fn`, () => {
  expect(() => grfn([`hi` as unknown as Fn])).toThrow(TypeError)
})

test(`throws on zero vertices`, () => {
  expect(() => grfn([])).toThrow(new Error(`expected 1 output fn: 0`))
})

test(`throws on cycle`, () => {
  expect(() =>
    grfn([
      [c, [d]],
      [a, [b, c, d]],
      [b, [c]],
      [d, [b, e]],
      [e, [c]],
    ]),
  ).toThrow(new Error(`expected acyclic: c <- d <- e <- c`))
})

test(`throws on unknown fn`, () => {
  expect(() => grfn([[c, [d]]])).toThrow(new Error(`expected known fn: d`))
})

// eslint-disable-next-line jest/expect-expect
test(`debug works`, works)
