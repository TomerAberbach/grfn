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

export const getOutputFn = graph => {
  const leafFns = new Set(graph.keys())

  for (const fn of graph.keys()) {
    for (const dependency of graph.get(fn)) {
      leafFns.delete(dependency)
    }
  }

  return leafFns.values().next().value
}

export const getInputFns = graph =>
  [...graph.entries()]
    .filter(([, dependencies]) => dependencies.length === 0)
    .map(([fn]) => fn)
