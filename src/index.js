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

const grfn = vertices => {
  const graph = new Map()
  for (const [key, vertex] of Object.entries(vertices)) {
    const [fn, dependencies = []] = [vertex].flat()
    graph.set(key, [fn, [...dependencies]])
  }

  const leafKeys = new Set(graph.keys())
  for (const [, dependencies] of graph.values()) {
    for (const dependency of dependencies) {
      leafKeys.delete(dependency)
    }
  }
  const outputKey = leafKeys.values().next().value

  return (...inputs) => {
    const deferreds = new Map()
    for (const key of graph.keys()) {
      deferreds.set(key, deferred())
    }

    for (const [key, [fn, dependencies]] of graph) {
      Promise.all(
        dependencies.length === 0
          ? inputs
          : dependencies.map(dependency => deferreds.get(dependency)._promise),
      )
        .then(args => deferreds.get(key)._resolve(fn(...args)))
        .catch(error => deferreds.get(key)._reject(error))
    }

    return deferreds.get(outputKey)._promise
  }
}

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { _promise: promise, _resolve: resolve, _reject: reject }
}

export default grfn
