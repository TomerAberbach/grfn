type Fn = (...args: any) => any

type Grfn<I extends any[], O> = {
  type: 'grfn'
  (...args: I): Promise<O>
}

declare const grfn: <I extends any[], O>(
  vertices: (Fn | [Fn, Fn[]])[]
) => Grfn<I, O>

export = grfn
