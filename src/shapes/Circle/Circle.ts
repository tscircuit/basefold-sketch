import type { GraphicsObject } from "graphics-debug"
import type { Constraint, Point, Shape, SvgTransform } from "../../core"
import { Point as SketchPoint } from "../../core"
import { FixedSegmentLength } from "../constraints/FixedSegmentLength"
import { Circle_toGraphicsObject } from "./Circle_toGraphicsObject"
import { Circle_getBounds, Circle_toSvg } from "./Circle_toSvg"

export class Circle implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: {
    name: string
    cx?: number
    cy?: number
    radius?: number
  }) {
    if (!opts.name) {
      throw new Error("Circle requires a non-empty name.")
    }

    this.name = opts.name

    const cx = opts.cx ?? 0
    const cy = opts.cy ?? 0
    const radius = opts.radius ?? 1

    if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
      throw new Error("Circle center coordinates must be finite numbers.")
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error(
        `Circle radius must be a positive finite number. Got: ${radius}`,
      )
    }

    const center = new SketchPoint(cx, cy)
    const radiusPoint = new SketchPoint(cx + radius, cy)

    this.points = {
      center,
      radius: radiusPoint,
    }

    this._internal = []

    if (opts.radius !== undefined) {
      this._internal.push(new FixedSegmentLength(center, radiusPoint, radius))
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return Circle_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return Circle_toGraphicsObject(this.name, this.points)
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    return Circle_getBounds(this.points)
  }
}
