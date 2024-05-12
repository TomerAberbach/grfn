<div align="center">
  <img src="grfn.svg" alt="grfn" width="400" />
</div>

<h1 align="center">
  grfn
</h1>

<div align="center">
  <a href="https://npmjs.org/package/grfn">
    <img src="https://badgen.now.sh/npm/v/grfn" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/grfn/actions">
    <img src="https://github.com/TomerAberbach/grfn/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://unpkg.com/grfn/dist/index.min.js">
    <img src="https://deno.bundlejs.com/?q=grfn&badge" alt="gzip size" />
  </a>
  <a href="https://unpkg.com/grfn/dist/index.min.js">
    <img src="https://deno.bundlejs.com/?q=grfn&config={%22compression%22:{%22type%22:%22brotli%22}}&badge" alt="brotli size" />
  </a>
</div>

<div align="center">
  A tiny (~320B) utility that executes a dependency graph of async functions as concurrently as possible.
</div>

## Features

- **Lightweight:** ~320 bytes gzipped
- **Unobtrusive and Unopinionated:** takes normal functions; returns a normal
  function!
- **Isomorphic:** works in node and the browser
- **Easy Debugging:** provides type-level cycle detection as well as PNG, SVG,
  and GIF dependency graph previews through the [`grfnviz`](packages/grfnviz)
  package!
- **Awesome Logo:** designed by [Jill Marbach](https://jillmarbach.com)!

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
$ npm i grfn
```

## Usage

An illustrative example (with a GIF generated using
[`grfnviz`](packages/grfnviz)!):

<img src="animation.gif" width="350" align="right">

<!-- eslint-skip -->

```js
import grfn from 'grfn'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

async function taskA(n1, n2, n3) {
  await delay(15)
  return n1 + n2 + n3
}

async function taskB(n1, n2, n3) {
  await delay(10)
  return n1 * n2 * n3
}

async function taskC(a, b) {
  await delay(5)
  return a + b
}

async function taskD(b) {
  await delay(1)
  return b * 2
}

async function taskE(a, c, d) {
  await delay(10)
  return a * c * d
}

const runTasks = grfn({
  // `taskE` depends on `taskA`, `taskC`, and `taskD`
  // Call `taskE` with the results of the functions
  // once their returned promises resolve
  e: [taskE, [`a`, `c`, `d`]],

  d: [taskD, [`b`]], // `taskD` depends on `taskB`
  c: [taskC, [`a`, `b`]], // `taskC` depends on `taskA` and `taskB`

  // `taskA` and `taskB` have no dependencies! (But they must still be listed)
  // They take the input given to `runTasks`
  a: taskA,
  b: taskB,
})

const output = await runTasks(4, 2, 3)

// This will be the output of `taskE`
// because no function depends on it!
console.log(`final output: ${output}`)
```

Output:

```
final output: 14256
```

### Debugging

Your graph will be automatically validated, including cycle detection, via
TypeScript magic!

To generate previews and GIFs (like above!) use the
[`grfnviz` package](packages/grfnviz)!

## API

### `grfn(vertices) => (...args) => Promise`

Returns a function that runs the dependency graph of functions described by
`vertices`:

- Input: passed to the functions that don't have dependencies in the graph
- Output: a `Promise` that resolves to the value returned from the graph's
  _output function_, the function that is not depended on by any function

#### `vertices`

Type: `{ [key: string]: Function | [Function, string[]] }`

An object describing a dependency graph of functions.

Each value in `vertices` must be either:

- A pair containing a function and its array of dependencies by key (e.g.
  `[fnA, ['keyB', 'keyC']]`)
- Or a function (equivalent to `[fn, []]`)

The following constraints, which are validate via TypeScript magic, must also be
met:

- Each dependency in `vertices` must also appear as a non-dependency:
  - Not okay (`b` doesn't appear as a non-dependency):
    <!-- prettier-ignore -->
    ```js
    grfn({
      a: [fnA, [`b`]],
    })
    ```
  - Okay:
    <!-- prettier-ignore -->
    ```js
    grfn({
      a: [fnA, [`b`]],
      b: fnB,
    })
    ```
- `vertices` must describe an
  [acyclic](https://en.wikipedia.org/wiki/Directed_acyclic_graph) dependency
  graph:
  - Not okay (cycle: `a -> b -> a`):
    <!-- prettier-ignore -->
    ```js
    grfn({
      a: [fnA, [`b`]],
      b: [fnB, [`a`]],
    })
    ```
  - Okay:
    <!-- prettier-ignore -->
    ```js
    grfn({
      a: [fnA, [`b`]],
      b: fnB,
    })
    ```
- `vertices` must have exactly one _output function_, a function that is not
  depended on by any function:
  - Not okay (both `b` and `c` are not depended on by any function):
    <!-- prettier-ignore -->
    ```js
    grfn({
      b: [fnB, [`a`]],
      c: [fnC, [`a`]],
      a: fnA,
    })
    ```
  - Okay:
    <!-- prettier-ignore -->
    ```js
    grfn({
      d: [fnD, [`b`, `c`]],
      b: [fnB, [`a`]],
      c: [fnC, [`a`]],
      a: fnA,
    })
    ```

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/grfn/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/grfn/blob/main/contributing.md).

## License

[Apache 2.0](https://github.com/TomerAberbach/grfn/blob/main/license)

This is not an official Google product.
