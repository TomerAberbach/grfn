type Grfn<I extends any[] = any[], O = any> = {
  type: 'grfn'
  (...args: I): Promise<O>
}

export const getSvg: (grfn: Grfn) => Promise<Buffer>

export const getPng: (grfn: Grfn) => Promise<Buffer>

export const previewInBrowser: (grfn: Grfn) => Promise<void>

export type Gifn<I extends any[], O> = (
  ...args: I
) => Promise<{ output: O; gif: Buffer }>

export const gifn: <I extends any[], O>(grfn: Grfn<I, O>) => Gifn<I, O>
