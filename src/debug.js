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

import validator from './v.js'

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
            .join(` <- `)}`,
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
