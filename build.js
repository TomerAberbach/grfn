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

import { dirname, join, relative } from 'path'
import { gzip as gzipCb } from 'zlib'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { minify } from 'terser'
import { getAllFiles } from 'get-all-files'
import grfn from './src/index.js'
import './src/debug.js'

const gzip = promisify(gzipCb)

const terserConfig = {
  ecma: 2015,
  mangle: {
    properties: {
      // eslint-disable-next-line camelcase
      keep_quoted: true,
    },
  },
  module: true,
  nameCache: {
    props: {
      props: {
        $gr: `gr`,
      },
    },
  },
}

const mapAsync = (array, fn) => array.map(async value => fn(await value))

const findFiles = async base => ({
  base,
  filenames: (await getAllFiles(join(base, `src`)).toArray()).filter(name =>
    name.endsWith(`.js`),
  ),
})

const readFiles = ({ base, filenames }) =>
  filenames.map(async filename => ({
    base,
    name: relative(join(base, `src`), filename),
    code: (await fs.readFile(filename)).toString(`utf8`),
  }))

const minifyFiles = files =>
  mapAsync(files, async ({ base, name, code }) => ({
    base,
    name,
    code: (
      await minify(
        code,
        base.includes(`grfnviz`)
          ? {
              ...terserConfig,
              mangle: {
                properties: {
                  regex: /^gr$/u,
                },
              },
            }
          : terserConfig,
      )
    ).code,
  }))

const outputFiles = files =>
  Promise.all(
    mapAsync(files, async ({ base, name, code }) => {
      const filename = join(base, `dist`, name)
      try {
        await fs.mkdir(dirname(filename), { recursive: true })
      } catch (error) {
        if (error.code !== `EEXIST`) {
          throw error
        }
      }
      await fs.writeFile(filename, code)
    }),
  )

const computeFileSizes = async files => {
  const sizes = await Promise.all(
    mapAsync(files, async ({ base, name, code }) => ({
      name: join(base, name),
      minified: code.length,
      gzipped: (await gzip(code)).length,
    })),
  )
  sizes.sort((a, b) => a.name.localeCompare(b.name))
  return sizes
}

const logFileSizes = sizes => {
  for (const { name, minified, gzipped } of sizes) {
    console.log(name)
    console.log(`Size: ${minified} B`)
    console.log(`Gzipped: ${gzipped} B`)
    console.log()
  }
}

const build = grfn([
  [logFileSizes, [computeFileSizes, outputFiles]],
  [computeFileSizes, [minifyFiles]],
  [outputFiles, [minifyFiles]],
  [minifyFiles, [readFiles]],
  [readFiles, [findFiles]],
  findFiles,
])

build(`.`)
build(`./packages/grfnviz`)
