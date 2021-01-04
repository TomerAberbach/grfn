type Fn = (...args: any) => any

declare const grfn: {
  <I extends any[], T>(vertices: (Fn | [Fn, Fn[]])[]): (...args: I) => Promise<T>
  preview(vertices: (Fn | [Fn, Fn[]])[]): Promise<void>
}

export = grfn
