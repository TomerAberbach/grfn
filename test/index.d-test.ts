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

import { expectAssignable, expectType } from 'tsd'
import grfn, { Grfn } from '../src'

async function taskA(n1: number, n2: number, n3: number): Promise<number> {
  return n1 + n2 + n3
}

async function taskB(n1: number, n2: number, n3: number): Promise<number> {
  return n1 * n2 * n3
}

async function taskC(a: number, b: number): Promise<number> {
  return a + b
}

async function taskD(b: number): Promise<number> {
  return b * 2
}

async function taskE(a: number, c: number, d: number): Promise<number> {
  return a * c * d
}

const runTasks = grfn([
  // `taskE` depends on `taskA`, `taskC`, and `taskD`
  // Call `taskE` with the results of the functions
  // once their returned promises resolve
  [taskE, [taskA, taskC, taskD]],

  [taskD, [taskB]], // `taskD` depends on `taskB`
  [taskC, [taskA, taskB]], // `taskC` depends on `taskA` and `taskB`

  // `taskA` and `taskB` have no dependencies! (But they must still be listed)
  // They take the input given to `runTasks`
  taskA,
  taskB
])

expectAssignable<Grfn<[number, number, number], number>>(runTasks)
expectAssignable<Promise<number>>(runTasks(4, 2, 3))
