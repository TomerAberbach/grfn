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
import grfn from '../../../../src/index.js'
import toDot from '../../src/browser/to-dot.js'

/* eslint-disable no-empty-function */
function a() {}
function b() {}
function c() {}
function d() {}
/* eslint-enable no-empty-function */

const run = grfn([[a, [b, c]], [b, [d]], [c, [d]], d])

test(`toDot`, t => {
  t.snapshot(toDot({ graph: run.gr }))
})
