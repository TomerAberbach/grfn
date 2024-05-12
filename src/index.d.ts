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

/* eslint-disable typescript/no-explicit-any */

import type { Join, Simplify, UnionToIntersection } from 'type-fest'

export type Fn = (...args: any) => any

declare const grfn: <const Entries extends VertexEntries>(
  vertices: CheckVertices<Entries>,
) => (
  ...args: Parameters<UnionToIntersection<GetDependencylessFunctions<Entries>>>
) => Promise<Awaited<ReturnType<GetFunction<Entries, GetOutputKeys<Entries>>>>>

type CheckVertices<Entries extends VertexEntries> =
  GetErrors<Entries>[number][1] extends never ? Entries : GetErrors<Entries>

type GetErrors<Entries extends VertexEntries> = [
  ...CheckDependencylessFunctions<Entries>,
  ...CheckUndefinedDependencyKeys<Entries>,
  ...CheckOutputKeys<Entries>,
  ...CheckCycles<Entries>,
  ...CheckKeysMismatchingDependencyOutputs<Entries>,
]

type CheckDependencylessFunctions<Entries extends VertexEntries> =
  HasIncompatibleDependencylessFunctions<Entries> extends true
    ? [
        [
          `Error: input vertices with incompatible parameters`,
          GetInputParameters<Entries>,
        ],
      ]
    : []
type HasIncompatibleDependencylessFunctions<Entries extends VertexEntries> = {
  [Key in keyof GetInputParameters<Entries>]: GetInputParameters<Entries>[Key] extends never
    ? true
    : false
}[number]
type GetInputParameters<Entries extends VertexEntries> = UnionToIntersection<
  Parameters<GetDependencylessFunctions<Entries>>
>
type GetDependencylessFunctions<Entries extends VertexEntries> = {
  [Key in keyof Entries]: GetEntryDependencyKeys<Entries[Key]> extends never
    ? GetFunction<Entries, Key>
    : never
}[keyof Entries]

type CheckUndefinedDependencyKeys<Entries extends VertexEntries> =
  GetUndefinedDependencyKeys<Entries> extends never
    ? []
    : [['Error: undefined vertices', GetUndefinedDependencyKeys<Entries>]]
type GetUndefinedDependencyKeys<Entries extends VertexEntries> = Exclude<
  GetDependencyKeys<Entries>,
  GetDependentKeys<Entries>
>

type CheckOutputKeys<Entries extends VertexEntries> =
  IsUnion<GetOutputKeys<Entries>> extends true
    ? [['Error: not exactly one output vertex', GetOutputKeys<Entries>]]
    : []
type IsUnion<Type> = [Type] extends [UnionToIntersection<Type>] ? false : true
type GetOutputKeys<Entries extends VertexEntries> = Exclude<
  GetDependentKeys<Entries>,
  GetDependencyKeys<Entries>
>

type CheckCycles<Entries extends VertexEntries> =
  GetCycles<Entries> extends never
    ? []
    : [['Error: cycles', GetCycles<Entries>]]
type GetCycles<Entries extends VertexEntries> = Simplify<
  {
    [Key in keyof Entries]: GetCycleFrom<Entries, Key> extends string[]
      ? Join<GetCycleFrom<Entries, Key>, ' -> '>
      : never
  }[keyof Entries]
>
type GetCycleFrom<
  Entries extends VertexEntries,
  FromKey extends keyof Entries,
  VisitedKeys extends (keyof Entries)[] = [FromKey],
> = Entries[FromKey] extends readonly [Fn, infer DependencyKeys]
  ? DependencyKeys extends readonly string[]
    ? {
        [DependencyKeyIndex in keyof DependencyKeys]: DependencyKeys[DependencyKeyIndex] extends VisitedKeys[number]
          ? [...VisitedKeys, DependencyKeys[DependencyKeyIndex]]
          : DependencyKeys[DependencyKeyIndex] extends keyof Entries
            ? GetCycleFrom<
                Entries,
                DependencyKeys[DependencyKeyIndex],
                [...VisitedKeys, DependencyKeys[DependencyKeyIndex]]
              >
            : never
      }[number]
    : never
  : never

type CheckKeysMismatchingDependencyOutputs<Entries extends VertexEntries> =
  GetKeysMismatchingDependencyOutputs<Entries> extends never
    ? []
    : [
        [
          `Error: vertices with parameters mismatching dependency outputs`,
          GetKeysMismatchingDependencyOutputs<Entries>,
        ],
      ]
type GetKeysMismatchingDependencyOutputs<Entries extends VertexEntries> =
  Simplify<
    {
      [Key in keyof Entries]: GetEntryDependencyKeysArray<
        Entries[Key]
      > extends never
        ? never
        : GetFunction<Entries, Key> extends (
              ...args: GetOutputs<
                Entries,
                GetEntryDependencyKeysArray<Entries[Key]>
              >
            ) => any
          ? never
          : Key
    }[keyof Entries]
  >
type GetOutputs<
  Entries extends VertexEntries,
  Keys extends readonly string[],
> = Keys extends readonly [infer FirstKey, ...infer RestKeys]
  ? [
      ...(FirstKey extends keyof Entries
        ? [Awaited<ReturnType<GetFunction<Entries, FirstKey>>>]
        : []),
      ...(RestKeys extends readonly string[]
        ? GetOutputs<Entries, RestKeys>
        : []),
    ]
  : []

type GetDependentKeys<Entries extends VertexEntries> = keyof Entries
type GetDependencyKeys<Entries extends VertexEntries> = {
  [Key in keyof Entries]: GetEntryDependencyKeys<Entries[Key]>
}[keyof Entries]
type GetEntryDependencyKeys<Entry extends VertexEntry> =
  GetEntryDependencyKeysArray<Entry>[number]
type GetEntryDependencyKeysArray<Entry extends VertexEntry> =
  Entry extends readonly [Fn, infer DependencyKeys]
    ? DependencyKeys extends readonly string[]
      ? DependencyKeys
      : never
    : never

type GetFunction<
  Entries extends VertexEntries,
  Key extends keyof Entries,
> = Entries[Key] extends Fn
  ? Entries[Key]
  : Entries[Key] extends readonly [infer F, ...any[]]
    ? F extends Fn
      ? F
      : never
    : never

type VertexEntry = Fn | readonly [Fn, (readonly string[])?]
type VertexEntries = Readonly<Record<string, VertexEntry>>

export default grfn
