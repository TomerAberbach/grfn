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
import GIFEncoder from 'gifencoder'
import grfn from 'grfn'
import PNG from 'png-js'
import getImage from './get-image.js'
import { getInputFns, getOutputFn } from './graph.js'

const getFrame = async ({ graph, nodeAttributes, edgeAttributes }) => {
  const encodedImage = await getImage({
    graph,
    type: `png`,
    nodeAttributes,
    edgeAttributes,
  })
  const png = new PNG(encodedImage)
  const decodedImage = await new Promise(resolve => png.decode(resolve))
  return {
    width: png.width,
    height: png.height,
    data: decodedImage,
  }
}

const getGif = async ({ width, height, frames }) => {
  const encoder = new GIFEncoder(width, height)
  const stream = encoder.createReadStream()
  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(500)
  encoder.setQuality(10)

  for (const frame of frames) {
    encoder.addFrame(frame)
  }

  encoder.finish()

  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

const gifn = ({ gr: graph }) => {
  const inputFns = getInputFns(graph)
  const outputFn = getOutputFn(graph)

  const fns = new Map()
  const wrapFn = fn => {
    if (!fns.has(fn)) {
      fns.set(
        fn,
        async ({ input, deltas, nodeAttributes, edgeAttributes }, ...args) => {
          deltas.push(() =>
            nodeAttributes.set(fn, {
              color: `#137DCD`,
              style: `dashed`,
            }),
          )

          const output = await fn(...(args.length === 0 ? input : args))

          if (fn !== outputFn) {
            edgeAttributes.set(fn, {
              fontcolor: `transparent`,
              label: String(output),
            })
          }

          deltas.push(() => {
            nodeAttributes.set(fn, {
              color: `#9EE37D`,
              style: `filled`,
            })
            edgeAttributes.set(fn, { color: `#63C132` })

            if (fn !== outputFn) {
              edgeAttributes.get(fn).label = JSON.stringify(output)
            }
          })

          return fn === outputFn
            ? { deltas, nodeAttributes, edgeAttributes, output }
            : output
        },
      )
    }

    return fns.get(fn)
  }

  const getState = (...args) => ({
    input: args,
    deltas: [],
    nodeAttributes: new Map(),
    edgeAttributes: new Map(),
  })
  const vertices = Array.from(graph.entries(), ([fn, dependencies]) => [
    wrapFn(fn),
    [getState].concat(dependencies.map(wrapFn)),
  ])
  vertices.push([getState, []])
  const run = grfn(vertices)

  return async (...args) => {
    const { deltas, nodeAttributes, edgeAttributes, output } = await run(
      ...args,
    )
    const graphCopy = new Map(graph)

    const fakeInputFn = Object.defineProperty(() => args, `name`, {
      enumerable: false,
      writable: false,
      value: args.map(value => JSON.stringify(value)).join(`, `),
    })
    nodeAttributes.set(fakeInputFn, { shape: `plaintext` })
    graphCopy.set(fakeInputFn, [])
    for (const inputFn of inputFns) {
      graphCopy.set(inputFn, graphCopy.get(inputFn).concat(fakeInputFn))
    }
    deltas.unshift(() => edgeAttributes.set(fakeInputFn, { color: `#63C132` }))

    const fakeOutputFn = Object.defineProperty(o => o, `name`, {
      enumerable: false,
      writable: false,
      value: JSON.stringify(output),
    })
    nodeAttributes.set(fakeOutputFn, {
      shape: `plaintext`,
      fontcolor: `transparent`,
    })
    graphCopy.set(fakeOutputFn, [outputFn])
    edgeAttributes.set(outputFn, { color: `transparent` })
    const oldDelta = deltas[deltas.length - 1]
    deltas[deltas.length - 1] = () => {
      oldDelta()
      nodeAttributes.set(fakeOutputFn, { shape: `plaintext` })
    }

    const { width, height, data } = await getFrame({
      graph: graphCopy,
      nodeAttributes,
      edgeAttributes,
    })
    const frames = [data]
    for (const delta of deltas) {
      delta()
      frames.push(
        (await getFrame({ graph: graphCopy, nodeAttributes, edgeAttributes }))
          .data,
      )
    }

    return {
      output,
      gif: await getGif({ width, height, frames }),
    }
  }
}

export default gifn
