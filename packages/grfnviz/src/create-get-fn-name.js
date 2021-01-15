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

const createGetFnName = () => {
  const counts = new Map()
  const names = new Map()

  return fn => {
    if (names.has(fn)) {
      return names.get(fn)
    }

    let name = (fn.name ?? ``) === `` ? `unnamed` : fn.name

    if (!counts.has(name)) {
      names.set(fn, name)
      counts.set(name, 1)
      return name
    }

    const count = counts.get(name)
    counts.set(name, count + 1)

    name += ` (${count})`
    names.set(fn, name)

    return name
  }
}

export default createGetFnName
