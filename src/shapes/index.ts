export { Arc } from "./Arc/Arc"
export { Axis } from "./Axis/Axis"
export { Circle } from "./Circle/Circle"
export { InfiniteLine } from "./InfiniteLine/InfiniteLine"
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

export type { ArcOptions } from "./Arc/Arc"
export type { AxisOptions } from "./Axis/Axis"
export type {
  InfiniteLineDirection,
  InfiniteLineOptions,
} from "./InfiniteLine/InfiniteLine"
export type { LineOptions } from "./Line/Line"
export type { RightTriangleOptions } from "./RightTriangle/RightTriangle"
export type {
  LongBaseOrientation,
  TrapezoidOptions,
} from "./Trapezoid/Trapezoid"
export const Line = LineFactoryImpl
