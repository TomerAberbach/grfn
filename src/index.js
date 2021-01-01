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

import { validator } from './validate.js'

const createResolver = () => {
  const resolver = {}

  resolver.p = new Promise((resolve, reject) => {
    resolver.res = resolve
    resolver.rej = reject
  })

  return resolver
}

const createGraph = vertices => {
  const graph = new Map()
  for (const vertex of vertices) {
    const [fn, dependencies = []] = [].concat(vertex)
    graph.set(fn, dependencies)
  }

  const outputFn = validator.validateGraph(graph)

  return { graph, outputFn }
}

export const grfn = vertices => {
  const { graph, outputFn } = createGraph(vertices)

  return (...inputs) => {
    const resolvers = new Map(
      Array.from(graph.keys(), fn => [fn, createResolver()])
    )

    for (const [fn, dependencies] of graph.entries()) {
      Promise.all(
        dependencies.length === 0
          ? inputs
          : dependencies.map(dependency => resolvers.get(dependency).p)
      )
        .then(args => resolvers.get(fn).res(fn(...args)))
        .catch(error => resolvers.get(fn).rej(error))
    }

    return resolvers.get(outputFn).p
  }
}
