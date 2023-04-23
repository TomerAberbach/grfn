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
import createGetFnName from '../create-get-fn-name.js'

const getImage = ({ graph, type, nodeAttributes, edgeAttributes }) => {
  const digraph = graphviz.digraph(`G`)
  digraph.setNodeAttribut(`fontname`, `monospace`)
  digraph.setEdgeAttribut(`fontname`, `monospace`)

  const getFnName = createGetFnName()

  for (const fn of graph.keys()) {
    digraph.addNode(
      getFnName(fn),
      (nodeAttributes && nodeAttributes.get(fn)) || {},
    )
  }

  for (const [fn, dependencies] of graph.entries()) {
    for (const dependency of dependencies) {
      digraph.addEdge(
        getFnName(dependency),
        getFnName(fn),
        (edgeAttributes && edgeAttributes.get(dependency)) || {},
      )
    }
  }

  return new Promise((resolve, reject) =>
    digraph.render(
      {
        type,
        G: {
          size: `10,10!`,
          center: `true`,
        },
      },
      resolve,
      reject,
    ),
  )
}

export default getImage
