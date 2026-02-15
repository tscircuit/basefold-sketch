import type { GraphicsObject } from "graphics-debug"
import type { Constraint, Point, Shape, SvgTransform } from "../../core"
import { Point as SketchPoint } from "../../core"
import { EqualSegmentLengths } from "../constraints/EqualSegmentLengths"
import { FixedSegmentLength } from "../constraints/FixedSegmentLength"
import { HorizontalLine } from "../constraints/HorizontalLine"
import { ParallelLines } from "../constraints/ParallelLines"
import { VerticalLine } from "../constraints/VerticalLine"
import { Trapezoid_toGraphicsObject } from "./Trapezoid_toGraphicsObject"
import { Trapezoid_toSvg } from "./Trapezoid_toSvg"

export type LongBaseOrientation = "bottom" | "top" | "left" | "right" | "none"

export interface TrapezoidOptions {
  name: string
  shortBaseLength?: number
  longBaseLength?: number
  hasEqualLengthLegs?: true
  longBaseOrientation?: LongBaseOrientation
}

function addLineAlias(
  points: Record<string, Point>,
  line: string,
  start: Point,
  end: Point,
): void {
  points[`${line}.start`] = start
  points[`${line}.end`] = end
}

export class Trapezoid implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: TrapezoidOptions) {
    if (!opts.name) {
      throw new Error("Trapezoid requires a non-empty name.")
    }

    const shortBaseLength = opts.shortBaseLength
    const longBaseLength = opts.longBaseLength
    const orientation = opts.longBaseOrientation ?? "none"

    if (
      shortBaseLength !== undefined &&
      (!Number.isFinite(shortBaseLength) || shortBaseLength <= 0)
    ) {
      throw new Error(
        `Trapezoid shortBaseLength must be a positive finite number. Got: ${shortBaseLength}`,
      )
    }

    if (
      longBaseLength !== undefined &&
      (!Number.isFinite(longBaseLength) || longBaseLength <= 0)
    ) {
      throw new Error(
        `Trapezoid longBaseLength must be a positive finite number. Got: ${longBaseLength}`,
      )
    }

    if (
      shortBaseLength !== undefined &&
      longBaseLength !== undefined &&
      shortBaseLength > longBaseLength
    ) {
      throw new Error(
        `Trapezoid shortBaseLength (${shortBaseLength}) must not exceed longBaseLength (${longBaseLength}).`,
      )
    }

    if (
      opts.hasEqualLengthLegs !== undefined &&
      opts.hasEqualLengthLegs !== true
    ) {
      throw new Error("Trapezoid hasEqualLengthLegs only accepts true.")
    }

    if (
      orientation !== "bottom" &&
      orientation !== "top" &&
      orientation !== "left" &&
      orientation !== "right" &&
      orientation !== "none"
    ) {
      throw new Error(
        `Trapezoid longBaseOrientation must be one of: bottom, top, left, right, none. Got: ${orientation}`,
      )
    }

    this.name = opts.name

    const longInit = longBaseLength ?? 4
    const shortInit = shortBaseLength ?? 2
    const depth = 1

    let longBaseStart: Point
    let longBaseEnd: Point
    let shortBaseStart: Point
    let shortBaseEnd: Point

    if (orientation === "left") {
      const yOffset = (longInit - shortInit) / 2
      longBaseStart = new SketchPoint(0, 0)
      longBaseEnd = new SketchPoint(0, longInit)
      shortBaseStart = new SketchPoint(depth, yOffset)
      shortBaseEnd = new SketchPoint(depth, yOffset + shortInit)
    } else if (orientation === "right") {
      const yOffset = (longInit - shortInit) / 2
      longBaseStart = new SketchPoint(depth, 0)
      longBaseEnd = new SketchPoint(depth, longInit)
      shortBaseStart = new SketchPoint(0, yOffset)
      shortBaseEnd = new SketchPoint(0, yOffset + shortInit)
    } else if (orientation === "top") {
      const xOffset = (longInit - shortInit) / 2
      longBaseStart = new SketchPoint(0, -depth)
      longBaseEnd = new SketchPoint(longInit, -depth)
      shortBaseStart = new SketchPoint(xOffset, 0)
      shortBaseEnd = new SketchPoint(xOffset + shortInit, 0)
    } else {
      const xOffset = (longInit - shortInit) / 2
      longBaseStart = new SketchPoint(0, 0)
      longBaseEnd = new SketchPoint(longInit, 0)
      shortBaseStart = new SketchPoint(xOffset, -depth)
      shortBaseEnd = new SketchPoint(xOffset + shortInit, -depth)
    }

    const leg1Start = longBaseStart
    const leg1End = shortBaseStart
    const leg2Start = longBaseEnd
    const leg2End = shortBaseEnd

    const points: Record<string, Point> = {
      longBaseStart,
      longBaseEnd,
      shortBaseStart,
      shortBaseEnd,
    }

    addLineAlias(points, "longBase", longBaseStart, longBaseEnd)
    addLineAlias(points, "shortBase", shortBaseStart, shortBaseEnd)
    addLineAlias(points, "leg1", leg1Start, leg1End)
    addLineAlias(points, "leg2", leg2Start, leg2End)

    if (orientation !== "none") {
      if (orientation === "bottom") {
        addLineAlias(points, "bottommostBase", longBaseStart, longBaseEnd)
        addLineAlias(points, "topmostBase", shortBaseStart, shortBaseEnd)
        addLineAlias(points, "leftmostLeg", leg1Start, leg1End)
        addLineAlias(points, "rightmostLeg", leg2Start, leg2End)
      }

      if (orientation === "top") {
        addLineAlias(points, "topmostBase", longBaseStart, longBaseEnd)
        addLineAlias(points, "bottommostBase", shortBaseStart, shortBaseEnd)
        addLineAlias(points, "leftmostLeg", leg1Start, leg1End)
        addLineAlias(points, "rightmostLeg", leg2Start, leg2End)
      }

      if (orientation === "left") {
        addLineAlias(points, "leftmostBase", longBaseStart, longBaseEnd)
        addLineAlias(points, "rightmostBase", shortBaseStart, shortBaseEnd)
        addLineAlias(points, "topmostLeg", leg1Start, leg1End)
        addLineAlias(points, "bottommostLeg", leg2Start, leg2End)
      }

      if (orientation === "right") {
        addLineAlias(points, "rightmostBase", longBaseStart, longBaseEnd)
        addLineAlias(points, "leftmostBase", shortBaseStart, shortBaseEnd)
        addLineAlias(points, "topmostLeg", leg1Start, leg1End)
        addLineAlias(points, "bottommostLeg", leg2Start, leg2End)
      }
    }

    this.points = points
    this._internal = [
      new ParallelLines(
        longBaseStart,
        longBaseEnd,
        shortBaseStart,
        shortBaseEnd,
      ),
    ]

    if (longBaseLength !== undefined) {
      this._internal.push(
        new FixedSegmentLength(longBaseStart, longBaseEnd, longBaseLength),
      )
    }

    if (shortBaseLength !== undefined) {
      this._internal.push(
        new FixedSegmentLength(shortBaseStart, shortBaseEnd, shortBaseLength),
      )
    }

    if (opts.hasEqualLengthLegs) {
      this._internal.push(
        new EqualSegmentLengths(leg1Start, leg1End, leg2Start, leg2End),
      )
    }

    if (orientation === "bottom" || orientation === "top") {
      this._internal.push(new HorizontalLine(longBaseStart, longBaseEnd))
      this._internal.push(new HorizontalLine(shortBaseStart, shortBaseEnd))
    }

    if (orientation === "left" || orientation === "right") {
      this._internal.push(new VerticalLine(longBaseStart, longBaseEnd))
      this._internal.push(new VerticalLine(shortBaseStart, shortBaseEnd))
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return Trapezoid_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return Trapezoid_toGraphicsObject(this.name, this.points)
  }
}
