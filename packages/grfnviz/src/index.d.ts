type isNode = ReturnType<typeof setTimeout> extends number ? false : true

type NodeOnly<T> = isNode extends true ? T : never

type Grfn<I extends any[] = any[], O = any> = {
  type: 'grfn'
  (...args: I): Promise<O>
}

export const getSvg: (
  grfn: Grfn
) => Promise<isNode extends true ? Buffer : string>

export const getPng: NodeOnly<(grfn: Grfn) => Promise<Buffer>>

export const previewInBrowser: NodeOnly<(grfn: Grfn) => Promise<void>>

export type Gifn<I extends any[], O> = (
  ...args: I
) => Promise<{ output: O; gif: Buffer }>

export const gifn: NodeOnly<
  <I extends any[], O>(grfn: Grfn<I, O>) => Gifn<I, O>
>
