export { Circle } from "./Circle/Circle"
export { Oval } from "./Oval/Oval"
export { Rectangle } from "./Rectangle/Rectangle"
export { RightTriangle } from "./RightTriangle/RightTriangle"
export { Trapezoid } from "./Trapezoid/Trapezoid"

import { type LineOptions, Line as LineShape } from "./Line/Line"

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

export type { LineOptions } from "./Line/Line"
export type { RightTriangleOptions } from "./RightTriangle/RightTriangle"
export type {
  LongBaseOrientation,
  TrapezoidOptions,
} from "./Trapezoid/Trapezoid"
export const Line = LineFactoryImpl
