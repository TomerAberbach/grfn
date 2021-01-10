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

import open from 'open'
import getImage from './get-image.js'
import gifn from './gifn.js'

export const getSvg = ({ gr: graph }) => getImage({ graph, type: `svg` })

export const getPng = ({ gr: graph }) => getImage({ graph, type: `png` })

export const previewInBrowser = async grfn => {
  const html = Buffer.concat([
    Buffer.from(
      `<head><title>grfn</title></head><body style="display: grid; place-items: center; min-height: 100%; margin: 0;">`
    ),
    await getSvg(grfn),
    Buffer.from(`</body>`)
  ]).toString(`base64`)

  await open(`data:text/html;base64,${html}`)
}

export { gifn }
