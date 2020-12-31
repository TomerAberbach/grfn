const createResolver = () => {
  const resolver = {}

  resolver.promise = new Promise((resolve, reject) => {
    resolver.res = resolve
    resolver.rej = reject
  })

  return resolver
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`expected ${message()}`)
  }
}

const createGraph = vertices => {
  const graph = new Map()
  for (const vertex of vertices) {
    const [fn, dependencies = []] = [].concat(vertex)
    assert(typeof fn === `function`, fn)
    graph.set(fn, dependencies)
  }

  const leafFns = new Set(graph.keys())
  const visited = new Set()

  for (const rootFn of graph.keys()) {
    if (visited.has(rootFn)) {
      continue
    }

    const stack = [{ explored: new Set(), fn: rootFn }]
    do {
      const { fn, explored } = stack.pop()

      assert(
        !explored.has(fn),
        () => `acyclic: ${[...explored, fn].map(exploredFn => exploredFn.name).join(` <- `)}`
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

  const outputFn = leafFns.values().next().value

  return { graph, outputFn }
}

export const grfn = vertices => {
  const { graph, outputFn } = createGraph(vertices)

  return (...inputs) => {
    const resolvers = new Map(Array.from(graph.keys(), fn => [fn, createResolver()]))

    for (const [fn, dependencies] of graph.entries()) {
      Promise.all(
        dependencies.length === 0
          ? inputs
          : dependencies.map(dependency => resolvers.get(dependency).promise)
      )
        .then(args => resolvers.get(fn).res(fn(...args)))
        .catch(error => resolvers.get(fn).rej(error))
    }

    return resolvers.get(outputFn).promise
  }
}
