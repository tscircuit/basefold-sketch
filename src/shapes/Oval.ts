import type { Constraint, Point, Shape, SvgTransform } from "../core"
import { Point as SketchPoint } from "../core"
import { FixedSegmentLength } from "./constraints/FixedSegmentLength"
import { HorizontalLine } from "./constraints/HorizontalLine"
import { VerticalLine } from "./constraints/VerticalLine"

export class Oval implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: {
    name: string
    cx?: number
    cy?: number
    rx?: number
    ry?: number
  }) {
    if (!opts.name) {
      throw new Error("Oval requires a non-empty name.")
    }

    this.name = opts.name

    const cx = opts.cx ?? 0
    const cy = opts.cy ?? 0
    const rx = opts.rx ?? 1
    const ry = opts.ry ?? 1

    if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
      throw new Error("Oval center coordinates must be finite numbers.")
    }

    if (!Number.isFinite(rx) || rx <= 0) {
      throw new Error(`Oval rx must be a positive finite number. Got: ${rx}`)
    }

    if (!Number.isFinite(ry) || ry <= 0) {
      throw new Error(`Oval ry must be a positive finite number. Got: ${ry}`)
    }

    const center = new SketchPoint(cx, cy)
    const radiusX = new SketchPoint(cx + rx, cy)
    const radiusY = new SketchPoint(cx, cy + ry)

    this.points = {
      center,
      radiusX,
      radiusY,
    }

    this._internal = [
      new HorizontalLine(center, radiusX),
      new VerticalLine(center, radiusY),
    ]

    if (opts.rx !== undefined) {
      this._internal.push(new FixedSegmentLength(center, radiusX, rx))
    }

    if (opts.ry !== undefined) {
      this._internal.push(new FixedSegmentLength(center, radiusY, ry))
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    const center = this.points.center
    const radiusXPoint = this.points.radiusX
    const radiusYPoint = this.points.radiusY

    const dx = radiusXPoint.x - center.x
    const dy = radiusXPoint.y - center.y
    const rx = Math.sqrt(dx * dx + dy * dy)

    const ex = radiusYPoint.x - center.x
    const ey = radiusYPoint.y - center.y
    const ry = Math.sqrt(ex * ex + ey * ey)

    return `<ellipse cx="${t.x(center.x)}" cy="${t.y(center.y)}" rx="${rx}" ry="${ry}" />`
  }
}
