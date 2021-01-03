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

import graphviz from 'graphviz'
import open from 'open'
import validator from './validate.js'
import grfn from './index.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`expected ${message()}`)
  }
}

validator.validateGraph = graph => {
  const leafFns = new Set(graph.keys())
  const visited = new Set()

  for (const rootFn of graph.keys()) {
    assert(typeof rootFn === `function`, rootFn)

    if (visited.has(rootFn)) {
      continue
    }

    const stack = [{ explored: new Set(), fn: rootFn }]
    do {
      const { fn, explored } = stack.pop()

      assert(
        !explored.has(fn),
        () =>
          `acyclic: ${[...explored, fn]
            .map(exploredFn => exploredFn.name)
            .join(` <- `)}`
      )

      if (visited.has(fn)) {
        continue
      }

      visited.add(fn)
      explored.add(fn)

      for (const dependency of graph.get(fn)) {
        assert(graph.has(dependency), () => `known fn: ${dependency.name}`)
        leafFns.delete(dependency)
        stack.push({ fn: dependency, explored: new Set(explored) })
      }
    } while (stack.length > 0)
  }

  assert(leafFns.size === 1, () => `1 output fn: ${leafFns.size}`)

  return leafFns.values().next().value
}

grfn.preview = async vertices => {
  const graph = new Map()
  for (const vertex of vertices) {
    const [fn, dependencies = []] = [].concat(vertex)
    graph.set(fn, dependencies)
  }

  validator.validateGraph(graph)

  const digraph = graphviz.digraph(`G`)
  digraph.setNodeAttribut(`fontname`, `monospace`)

  for (const fn of graph.keys()) {
    digraph.addNode(fn.name)
  }

  for (const [fn, dependencies] of graph.entries()) {
    for (const dependency of dependencies) {
      digraph.addEdge(dependency.name, fn.name)
    }
  }

  const svg = await new Promise((resolve, reject) =>
    digraph.render(`svg`, resolve, reject)
  )

  const html = Buffer.concat([
    Buffer.from(
      `<head><title>grfn</title></head><body style="display: grid; place-items: center; min-height: 100%; margin: 0;">`
    ),
    svg,
    Buffer.from(`</body>`)
  ]).toString(`base64`)

  await open(`data:text/html;base64,${html}`)
}
