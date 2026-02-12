export { Circle } from "./Circle"
export { Oval } from "./Oval"
export { Rectangle } from "./Rectangle"

import { type LineOptions, Line as LineShape } from "./Line"

type LineShorthandOptions = Omit<LineOptions, "name"> & {
  name?: string
}

type LineFactory = {
  (opts?: LineShorthandOptions): LineShape
  new (opts?: LineShorthandOptions): LineShape
  prototype: LineShape
}

const LineFactoryImpl = function Line(
  this: unknown,
  opts?: LineShorthandOptions,
): LineShape {
  return new LineShape(opts ?? {})
} as LineFactory

LineFactoryImpl.prototype = LineShape.prototype

export type { LineOptions } from "./Line"
export const Line = LineFactoryImpl
