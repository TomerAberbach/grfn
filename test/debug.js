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
import grfn from '../src/index.js'
import '../src/debug.js'
import { works } from './helpers/index.js'

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

test(`debug works`, works)
