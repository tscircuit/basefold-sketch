import type { GraphicsObject } from "graphics-debug"
import type { Constraint, Point, Shape, SvgTransform } from "../../core"
import { Point as SketchPoint } from "../../core"
import { FixedSegmentLength } from "../constraints/FixedSegmentLength"
import { ParallelogramClosure } from "../constraints/ParallelogramClosure"
import { PerpendicularAt } from "../constraints/PerpendicularAt"
import { Rectangle_toGraphicsObject } from "./Rectangle_toGraphicsObject"
import { Rectangle_toSvg } from "./Rectangle_toSvg"

export class Rectangle implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: {
    name: string
    x?: number
    y?: number
    width?: number
    height?: number
  }) {
    if (!opts.name) {
      throw new Error("Rectangle requires a non-empty name.")
    }

    this.name = opts.name

    const x = opts.x ?? 0
    const y = opts.y ?? 0
    const w = opts.width ?? 1
    const h = opts.height ?? 1

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error("Rectangle x and y must be finite numbers.")
    }

    if (!Number.isFinite(w) || w <= 0) {
      throw new Error(
        `Rectangle width must be a positive finite number. Got: ${w}`,
      )
    }

    if (!Number.isFinite(h) || h <= 0) {
      throw new Error(
        `Rectangle height must be a positive finite number. Got: ${h}`,
      )
    }

    const topLeft = new SketchPoint(x, y)
    const topRight = new SketchPoint(x + w, y)
    const bottomLeft = new SketchPoint(x, y + h)
    const bottomRight = new SketchPoint(x + w, y + h)

    this.points = { topLeft, topRight, bottomLeft, bottomRight }

    this._internal = [
      new ParallelogramClosure(topLeft, topRight, bottomLeft, bottomRight),
      new PerpendicularAt(topLeft, topRight, bottomLeft),
    ]

    if (opts.width !== undefined) {
      this._internal.push(new FixedSegmentLength(topLeft, topRight, w))
    }

    if (opts.height !== undefined) {
      this._internal.push(new FixedSegmentLength(topLeft, bottomLeft, h))
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return Rectangle_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return Rectangle_toGraphicsObject(this.points)
  }
}
