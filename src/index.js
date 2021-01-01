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
