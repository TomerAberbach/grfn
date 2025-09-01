import { setTimeout } from 'node:timers/promises'
import grfn from './src/index.js'

const withLogging = fn =>
  Object.defineProperty(
    async (...args) => {
      console.log(`${fn.name} input: ${args.join(`, `)}`)
      const output = await fn(...args)
      console.log(`${fn.name} output: ${output}`)
      return output
    },
    `name`,
    {
      enumerable: false,
      writable: false,
      value: fn.name,
    },
  )

const fn = grfn({
  e: [
    withLogging(async (a, c, d) => {
      await setTimeout(10)
      return a * c * d
    }),
    [`a`, `c`, `d`],
  ],
  d: [
    withLogging(async b => {
      await setTimeout(1)
      return b * 2
    }),
    [`b`],
  ],
  c: [
    withLogging(async (a, b) => {
      await setTimeout(5)
      return a + b
    }),
    [`a`, `b`],
  ],
  a: withLogging(async (n1, n2, n3) => {
    await setTimeout(15)
    return n1 + n2 + n3
  }),
  b: withLogging(async (n1, n2, n3) => {
    await setTimeout(10)
    return n1 * n2 * n3
  }),
})
await fn(1, 2, 3)
