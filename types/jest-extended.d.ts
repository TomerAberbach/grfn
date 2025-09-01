/* eslint-disable typescript/no-empty-object-type */
/* eslint-disable typescript/consistent-type-definitions */
import type CustomMatchers from 'jest-extended'
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T> {}
  interface ExpectStatic<T = any> extends CustomMatchers<T> {}
}
