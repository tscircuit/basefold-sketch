import type { Constraint, Point, Shape, SvgTransform } from "../core"
import { Point as SketchPoint } from "../core"
import { FixedSegmentLength } from "./constraints/FixedSegmentLength"

export class Line implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: {
    name: string
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    length?: number
  }) {
    if (!opts.name) {
      throw new Error("Line requires a non-empty name.")
    }

    this.name = opts.name

    const x1 = opts.x1 ?? 0
    const y1 = opts.y1 ?? 0
    const x2 = opts.x2 ?? 1
    const y2 = opts.y2 ?? 0

    if (
      !Number.isFinite(x1) ||
      !Number.isFinite(y1) ||
      !Number.isFinite(x2) ||
      !Number.isFinite(y2)
    ) {
      throw new Error("Line endpoints must be finite numbers.")
    }

    if (
      opts.length !== undefined &&
      (!Number.isFinite(opts.length) || opts.length <= 0)
    ) {
      throw new Error(
        `Line length must be a positive finite number. Got: ${opts.length}`,
      )
    }

    const start = new SketchPoint(x1, y1)
    const end = new SketchPoint(x2, y2)

    this.points = { start, end }
    this._internal = []

    if (opts.length !== undefined) {
      this._internal.push(new FixedSegmentLength(start, end, opts.length))
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    const start = this.points.start
    const end = this.points.end

    return `<line x1="${t.x(start.x)}" y1="${t.y(start.y)}" x2="${t.x(end.x)}" y2="${t.y(end.y)}" />`
  }
}
