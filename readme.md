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

## Usage

TODO

## Contributing

Stars are always welcome!

For bugs and feature requests, [please create an issue](https://github.com/TomerAberbach/grfn/issues/new).

For pull requests, please read the [contributing guidelines](https://github.com/TomerAberbach/grfn/blob/main/contributing.md).

## License

[Apache 2.0](https://github.com/TomerAberbach/grfn/blob/main/license)

This is not an official Google product.
