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
import createGetFnName from '../create-get-fn-name.js'

const quote = string =>
  `"${string.replaceAll(`"`, `\\"`).replaceAll(`\n`, `\\n`)}"`

const serializeAttributes = attributes => {
  const entries = Object.entries(attributes)

  if (entries.length === 0) {
    return ``
  }

  return `[${entries
    .map(([key, value]) => `${key}=${quote(String(value))}`)
    .join(`,`)}]`
}

const serializeStatement = statement => `\n  ${statement};`

const toDot = ({ graph, nodeAttributes, edgeAttributes }) => {
  const getFnName = createGetFnName()
  const getNodeName = fn => quote(getFnName(fn))

  let dot = `digraph G {`
  dot += serializeStatement(
    `node${serializeAttributes({ fontname: `monospace` })}`,
  )
  dot += serializeStatement(
    `edge${serializeAttributes({ fontname: `monospace` })}`,
  )

  dot += `\n`
  for (const fn of graph.keys()) {
    dot += serializeStatement(
      `${getNodeName(fn)}${serializeAttributes(
        (nodeAttributes && nodeAttributes.get(fn)) || {},
      )}`,
    )
  }

  dot += `\n`
  for (const [fn, dependencies] of graph.entries()) {
    for (const dependency of dependencies) {
      dot += serializeStatement(
        `${getNodeName(dependency)} -> ${getNodeName(fn)}${serializeAttributes(
          (edgeAttributes && edgeAttributes.get(dependency)) || {},
        )}`,
      )
    }
  }

  dot += `\n}`
  return dot
}

export default toDot
