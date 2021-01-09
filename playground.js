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

import { promises as fs } from 'fs'
import grfn from './src/index.js'
import './src/node-debug.js'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))
const withLogging = fn =>
  Object.defineProperty(
    async (...args) => {
      console.log(`${fn.name} input: ${args.join(`, `)}`)
      const output = await fn(...args)
      console.log(`${fn.name} output: ${output}`)
      return output
    },
    `name`,
    {
      enumerable: false,
      writable: false,
      value: fn.name
    }
  )

/* eslint-disable */
const taskA = withLogging(async function taskA(n1, n2, n3) {
  await delay(15)
  return n1 + n2 + n3
})

const taskB = withLogging(async function taskB(n1, n2, n3) {
  await delay(10)
  return n1 * n2 * n3
})

const taskC = withLogging(async function taskC(a, b) {
  await delay(5)
  return a + b
})

const taskD = withLogging(async function taskD(b) {
  await delay(1)
  return b * 2
})

const taskE = withLogging(async function taskE(a, c, d) {
  await delay(10)
  return a * c * d
})
/* eslint-enable */

grfn
  .gifRun({
    vertices: [
      [taskE, [taskA, taskC, taskD]],
      [taskD, [taskB]],
      [taskC, [taskA, taskB]],
      taskA,
      taskB
    ],
    input: [4, 2, 3]
  })
  .then(buffer => fs.writeFile(`animation.gif`, buffer))

/*
 * Const taskA = (n1, n2, n3) => delay(15).then(() => n1 + n2 + n3)
 * const taskB = (n1, n2, n3) => delay(10).then(() => n1 * n2 * n3)
 * const taskC = (a, b) => delay(5).then(() => a + b)
 * const taskD = b => delay(1).then(() => b * 2)
 * const taskF = (a, c, d) => delay(10).then(() => a * c *d)
 *
 * const runTasks = grfn( [
 *   [taskF, [taskA, taskC, taskD]],
 *   [taskD, [taskB]],
 *   [taskC, [taskA, taskB]],
 *   taskA,
 *   taskB
 * ])
 * await runTasks(1, 2, 3)
 */
