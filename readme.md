# grfn

> A tiny (~400B) utility that executes a dependency graph of async functions as concurrently as possible.

## Features

- **Lightweight:** less than 400 bytes gzipped
- **Unobtrusive and Unopiniated:** takes normal functions; returns a normal function!
- **Isomorphic:** works in node and the browser
- **Easy Debugging:** provides cycle detection and SVG dependency graph previews through a `grfn/debug` module!

## Install

```sh
$ npm i grfn
```

To use the `grfn/debug` module, install the following dev dependencies:

```sh
$ npm i -D graphviz open
```

For the [`graphviz`](https://www.npmjs.com/package/graphviz) package to work, you'll need to install [GraphViz for your operating system](http://www.graphviz.org/download#executable-packages).

## Usage

```js
import grfn from './src/index.js'
import './src/debug.js'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))
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
      value: fn.name
    }
  )

const taskA = withLogging(async function taskA(n1, n2, n3) {
  await delay(10)
  return n1 + n2 + n3
})

const taskB = withLogging(async function taskB(n1, n2, n3) {
  await delay(15)
  return n1 * n2 * n3
})

const taskC = withLogging(async function taskC(a, b) {
  await delay(5)
  return a + b
})

const taskD = withLogging(async function taskD(b) {
  await delay(1)
  return b * 2
})

const taskF = withLogging(async function taskF(a, c, d) {
  await delay(10)
  return a * c * d
})

const runTasks = grfn([
  // `taskF` depends on `taskA`, `taskC`, and `taskD`
  // Call `taskF` with the results of the functions
  // once their returned promises resolve
  [taskF, [taskA, taskC, taskD]],

  [taskD, [taskB]], // `taskD` depends on `taskB`
  [taskC, [taskA, taskB]], // `taskC` depends on `taskA` and `taskB`

  // `taskA` and `taskB` have no dependencies!
  // They take the input given to `runTasks`
  taskA,
  taskB
])

runTasks(1, 2, 3).then(output => {
  // This will be the output of `taskF`
  // because no function depends on it!
  console.log(`final output: ${output}`)
})
```

Output:

```
taskA input: 1, 2, 3
taskB input: 1, 2, 3
taskA output: 6
taskB output: 6
taskD input: 6
taskC input: 6, 6
taskD output: 12
taskC output: 12
taskF input: 6, 12, 12
taskF output: 864
final output: 864
```

## Contributing

Stars are always welcome!

For bugs and feature requests, [please create an issue](https://github.com/TomerAberbach/grfn/issues/new).

For pull requests, please read the [contributing guidelines](https://github.com/TomerAberbach/grfn/blob/main/contributing.md).

## License

[Apache 2.0](https://github.com/TomerAberbach/grfn/blob/main/license)

This is not an official Google product.
