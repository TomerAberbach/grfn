/**
 * Copyright 2023 Google LLC
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

/* eslint-disable typescript/no-explicit-any */

type isNode = ReturnType<typeof setTimeout> extends number ? false : true

type NodeOnly<T> = isNode extends true ? T : never

type Grfn<I extends any[] = any[], O = any> = {
  type: 'grfn'
  (...args: I): Promise<O>
}

export const getSvg: (
  grfn: Grfn,
) => Promise<isNode extends true ? Buffer : string>

export const getPng: NodeOnly<(grfn: Grfn) => Promise<Buffer>>

export const previewInBrowser: NodeOnly<(grfn: Grfn) => Promise<void>>

export type Gifn<I extends any[], O> = (
  ...args: I
) => Promise<{ output: O; gif: Buffer }>

export const gifn: NodeOnly<
  <I extends any[], O>(grfn: Grfn<I, O>) => Gifn<I, O>
>
