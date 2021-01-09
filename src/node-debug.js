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

import './debug.js'
import graphviz from 'graphviz'
import open from 'open'
import PNG from 'png-js'
import GIFEncoder from 'gifencoder'
import validator from './validate.js'
import grfn from './index.js'

const createGraph = vertices => {
  const graph = new Map()
  for (const vertex of vertices) {
    const [fn, dependencies = []] = [].concat(vertex)
    graph.set(fn, dependencies)
  }

  try {
    return {
      graph,
      outputFn: validator.validateGraph(graph)
    }
  } catch (error) {
    console.error(error.message)
    return { graph }
  }
}

const getImage = ({
  graph,
  type,
  attributes = { node: new Map(), edge: new Map() }
}) => {
  const digraph = graphviz.digraph(`G`)
  digraph.setNodeAttribut(`fontname`, `monospace`)
  digraph.setEdgeAttribut(`fontname`, `monospace`)

  for (const fn of graph.keys()) {
    digraph.addNode(fn.name, attributes.node.get(fn) ?? {})
  }

  for (const [fn, dependencies] of graph.entries()) {
    for (const dependency of dependencies) {
      digraph.addEdge(
        dependency.name,
        fn.name,
        attributes.edge.get(dependency) ?? {}
      )
    }
  }

  return new Promise((resolve, reject) =>
    digraph.render(
      {
        type,
        G: {
          size: `10,10!`,
          center: `true`
        }
      },
      resolve,
      reject
    )
  )
}

grfn.preview = async vertices => {
  const svg = await getImage({
    graph: createGraph(vertices).graph,
    type: `svg`
  })

  const html = Buffer.concat([
    Buffer.from(
      `<head><title>grfn</title></head><body style="display: grid; place-items: center; min-height: 100%; margin: 0;">`
    ),
    svg,
    Buffer.from(`</body>`)
  ]).toString(`base64`)

  await open(`data:text/html;base64,${html}`)
}

grfn.gifRun = async ({ vertices, input }) => {
  const { graph, outputFn } = createGraph(vertices)
  const inputFns = [...graph.keys()].filter(fn => graph.get(fn).length === 0)

  const deltas = []
  const attributes = {
    node: new Map(),
    edge: new Map()
  }

  const fakeInputFn = Object.defineProperty(() => input, `name`, {
    enumerable: false,
    writable: false,
    value: input.map(value => JSON.stringify(value)).join(`, `)
  })
  attributes.node.set(fakeInputFn, { shape: `plaintext` })
  graph.set(fakeInputFn, [])
  for (const inputFn of inputFns) {
    graph.get(inputFn).push(fakeInputFn)
  }
  deltas.push(() => attributes.edge.set(fakeInputFn, { color: `#63C132` }))

  const fns = new Map()
  const wrapFn = fn => {
    if (!fns.has(fn)) {
      fns.set(fn, async (...args) => {
        deltas.push(() =>
          attributes.node.set(fn, {
            color: `#137DCD`,
            style: `dashed`
          })
        )

        const output = await fn(...args)

        if (fn !== outputFn) {
          attributes.edge.set(fn, {
            fontcolor: `transparent`,
            label: String(output)
          })
        }

        deltas.push(() => {
          attributes.node.set(fn, {
            color: `#9EE37D`,
            style: `filled`
          })
          attributes.edge.set(fn, {
            color: `#63C132`
          })

          if (fn !== outputFn) {
            attributes.edge.get(fn).label = JSON.stringify(output)
          }
        })

        return output
      })
    }

    return fns.get(fn)
  }

  const run = grfn(
    vertices.map(vertex =>
      []
        .concat(vertex)
        .map(value =>
          Array.isArray(value) ? value.map(wrapFn) : wrapFn(value)
        )
    )
  )

  const fakeOutputFn = Object.defineProperty(output => output, `name`, {
    enumerable: false,
    writable: false,
    value: JSON.stringify(await run(...input))
  })
  attributes.node.set(fakeOutputFn, {
    shape: `plaintext`,
    fontcolor: `transparent`
  })
  graph.set(fakeOutputFn, [outputFn])
  attributes.edge.set(outputFn, { color: `transparent` })
  const oldDelta = deltas[deltas.length - 1]
  deltas[deltas.length - 1] = () => {
    oldDelta()
    attributes.node.set(fakeOutputFn, { shape: `plaintext` })
  }

  const getFrame = async () => {
    const encodedImage = await getImage({ graph, type: `png`, attributes })
    const png = new PNG(encodedImage)
    const decodedImage = await new Promise(resolve => png.decode(resolve))
    return {
      width: png.width,
      height: png.height,
      data: decodedImage
    }
  }

  const { width, height, data } = await getFrame()

  const encoder = new GIFEncoder(width, height)
  const stream = encoder.createReadStream()
  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(500)
  encoder.setQuality(10)

  encoder.addFrame(data)

  for (const delta of deltas) {
    delta()
    encoder.addFrame((await getFrame()).data)
  }

  encoder.finish()

  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
