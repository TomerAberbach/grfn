import { setTimeout } from 'node:timers/promises'
import { expect, expectTypeOf, test } from 'vitest'
import grfn from './index.js'

test.skip(`grfn types`, () => {
  expectTypeOf(grfn({})).toExtend<(...args: never) => Promise<never>>()
  expectTypeOf(grfn({ a: (arg: number) => arg })).toExtend<
    (arg: number) => Promise<number>
  >()
  expectTypeOf(grfn({ a: (arg: number) => Promise.resolve(arg) })).toExtend<
    (arg: number) => Promise<number>
  >()
  expectTypeOf(grfn({ a: [(arg: number) => arg] })).toExtend<
    (arg: number) => Promise<number>
  >()
  expectTypeOf(grfn({ a: [(arg: number) => arg, []] })).toExtend<
    (arg: number) => Promise<number>
  >()
  expectTypeOf(
    grfn({
      a: [(a: number, b: number) => `${a + b}`, [`b`, `c`]],
      b: (arg: number) => arg * 2,
      c: (arg1: number, arg2: number) => arg1 * arg2,
    }),
  ).toExtend<(arg1: number, arg2: number) => Promise<string>>()

  grfn({
    // @ts-expect-error Incompatible input parameters.
    a: [(arg1: number, arg2: string) => arg1 + arg2, [`b`, `c`]],
    b: (arg: number) => arg,
    c: (arg: string) => arg,
  })
  // @ts-expect-error Undefined vertex.
  grfn({ a: [(arg: number) => arg, [`b`]] })
  // @ts-expect-error More than one output vertex.
  grfn({ a: (arg: number) => arg, b: (arg: number) => arg })
  // @ts-expect-error Cycle.
  grfn({ a: [(arg: number) => arg, [`b`]], b: [(arg: number) => arg, [`a`]] })
  // @ts-expect-error Parameters mismatching dependencies.
  grfn({ a: [(arg: string) => arg, [`b`]], b: (arg: number) => arg })
})

test(`grfn works`, async () => {
  const values: unknown[] = []

  const fn = grfn({
    o: [
      async (x: number, y: number, z: number) => {
        values.push([`o`, x, y, z])
        await setTimeout(1)
        return x + y + z
      },
      [`l`, `n`, `p`],
    ],
    n: [
      async (x: number) => {
        values.push([`n`, x])
        await setTimeout(3)
        return x * 2
      },
      [`m`],
    ],
    m: async (x: number, y: number) => {
      await setTimeout(4)
      values.push([`m`, x, y])
      return 2 * x + 3 * y
    },
    p: [
      async (x: number) => {
        values.push([`p`, x])
        await setTimeout(1)
        return x * 2
      },
      [`l`],
    ],
    l: async (x: number, y: number) => {
      values.push([`l`, x, y])
      await setTimeout(2)
      return x + y
    },
  })
  const result = await fn(1, 2)

  expect(values).toStrictEqual([
    [`l`, 1, 2],
    [`p`, 3],
    [`m`, 1, 2],
    [`n`, 8],
    [`o`, 3, 16, 6],
  ])
  expect(result).toBe(25)
})

test(`grfn propagates errors`, async () => {
  const fn = grfn({
    x: (arg: string) => {
      throw new Error(arg)
    },
  })

  await expect(() => fn(`BOOM!`)).rejects.toStrictEqual(new Error(`BOOM!`))
})
