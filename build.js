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

import { gzip as gzipCb } from 'zlib'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { minify } from 'terser'
import { transformAsync } from '@babel/core'
import grfn from './src/index.js'
import './src/debug.js'

const gzip = promisify(gzipCb)

const terserConfig = {
  ecma: 2015,
  mangle: {
    properties: true
  },
  module: true,
  nameCache: {}
}

const mapAsync = (array, fn) => array.map(async value => fn(await value))

const ensureDist = async () => {
  try {
    await Promise.all([
      fs.mkdir(`./dist/esm`, { recursive: true }),
      fs.mkdir(`./dist/cjs`, { recursive: true })
    ])
  } catch (error) {
    if (error.code !== `EEXIST`) {
      throw error
    }
  }
}

const findFiles = () => fs.readdir(`./src`)

const readFiles = names =>
  names.map(async name => ({
    name,
    code: (await fs.readFile(`./src/${name}`)).toString(`utf8`)
  }))

const createCjsFromFiles = files =>
  mapAsync(files, ({ name, code }) => ({
    name: `esm/${name}`,
    code
  })).concat(
    mapAsync(files, async ({ name, code }) => ({
      name: `cjs/${name}`,
      code: (
        await transformAsync(code, {
          plugins: [
            [
              `@babel/transform-modules-commonjs`,
              {
                loose: true,
                strict: true,
                noInterop: true
              }
            ],
            [
              `add-module-exports`,
              {
                addDefaultProperty: true
              }
            ]
          ]
        })
      ).code
    }))
  )

const minifyFiles = files =>
  mapAsync(files, async ({ name, code }) => ({
    name,
    code: (await minify(code, terserConfig)).code
  }))

const outputFiles = files =>
  Promise.all(
    mapAsync(files, ({ name, code }) => fs.writeFile(`./dist/${name}`, code))
  )

const computeFileSizes = async files => {
  const sizes = await Promise.all(
    mapAsync(files, async ({ name, code }) => ({
      name,
      minified: code.length,
      gzipped: (await gzip(code)).length
    }))
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

  [outputFiles, [minifyFiles, ensureDist]],
  ensureDist,

  [minifyFiles, [createCjsFromFiles]],
  [createCjsFromFiles, [readFiles]],
  [readFiles, [findFiles]],
  findFiles
])

build()
