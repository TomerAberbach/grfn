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

import grfn from '../../../../src/index.js'
import toDot from '../../src/browser/to-dot.js'

const run = grfn({
  a: [(arg1: number, arg2: number) => arg1 + arg2, [`b`, `c`]],
  b: [(arg: number) => arg * 2, [`d`]],
  c: [(arg: number) => arg * 3, [`d`]],
  d: (arg: number) => arg * 4,
})

test(`toDot`, () => {
  // @ts-expect-error Untyped.
  // eslint-disable-next-line typescript/no-unsafe-assignment
  expect(toDot({ graph: run.gr })).toMatchSnapshot()
})
