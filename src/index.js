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

import validator from './validate.js'

const createResolver = () => {
  let res
  let rej
  const prom = new Promise((resolve, reject) => {
    res = resolve
    rej = reject
  })
  return { prom, res, rej }
}

const grfn = vertices => {
  const graph = new Map()
  for (const vertex of vertices) {
    const [fn, dependencies = []] = [].concat(vertex)
    graph.set(fn, dependencies)
  }

  const outputFn = validator.validateGraph(graph)

  return (...inputs) => {
    const resolvers = new Map()
    for (const fn of graph.keys()) {
      resolvers.set(fn, createResolver())
    }

    for (const [fn, dependencies] of graph.entries()) {
      Promise.all(
        dependencies.length === 0
          ? inputs
          : dependencies.map(dependency => resolvers.get(dependency).prom)
      )
        .then(args => resolvers.get(fn).res(fn(...args)))
        .catch(error => resolvers.get(fn).rej(error))
    }

    return resolvers.get(outputFn).prom
  }
}

export default grfn
