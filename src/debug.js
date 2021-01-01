import { validator } from './validate.js'

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
