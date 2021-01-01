export const validator = {
  validateGraph: graph => {
    const leafFns = new Set(graph.keys())

    for (const fn of graph.keys()) {
      for (const dependency of graph.get(fn)) {
        leafFns.delete(dependency)
      }
    }

    return leafFns.values().next().value
  }
}
