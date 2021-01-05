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

import grfn from './src/index.js'

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

const taskA = withLogging(async (n1, n2, n3) => {
  await delay(15)
  return n1 + n2 + n3
})

const taskB = withLogging(async (n1, n2, n3) => {
  await delay(10)
  return n1 * n2 * n3
})

const taskC = withLogging(async (a, b) => {
  await delay(5)
  return a + b
})

const taskD = withLogging(async (b) => {
  await delay(1)
  return b * 2
})

const taskF = withLogging(async (a, c, d) => {
  await delay(10)
  return a * c * d
})

const runTasks = grfn([
  [taskF, [taskA, taskC, taskD]],
  [taskD, [taskB]],
  [taskC, [taskA, taskB]],
  taskA,
  taskB
])

const main = async () => {
  const output = await runTasks(1, 2, 3)
  console.log(`final output: ${output}`)
}

main()
