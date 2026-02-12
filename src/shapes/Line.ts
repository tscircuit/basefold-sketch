import type { Constraint, Point, Shape, SvgTransform } from "../core"
import { Point as SketchPoint } from "../core"
import { FixedSegmentLength } from "./constraints/FixedSegmentLength"
import { HorizontalLine } from "./constraints/HorizontalLine"
import { VerticalLine } from "./constraints/VerticalLine"

export interface LineOptions {
  name?: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  length?: number
  horizontal?: boolean
  vertical?: boolean
}

export class Line implements Shape {
  private static nextAutoNameId = 1

  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: LineOptions = {}) {
    if (opts.name !== undefined && !opts.name) {
      throw new Error("Line requires a non-empty name.")
    }

    this.name = opts.name ?? `Line${Line.nextAutoNameId++}`

    const x1 = opts.x1 ?? 0
    const y1 = opts.y1 ?? 0
    let x2 = opts.x2
    let y2 = opts.y2

    if (opts.horizontal !== undefined && typeof opts.horizontal !== "boolean") {
      throw new Error("Line horizontal flag must be a boolean.")
    }

    if (opts.vertical !== undefined && typeof opts.vertical !== "boolean") {
      throw new Error("Line vertical flag must be a boolean.")
    }

    if (opts.horizontal && opts.vertical) {
      throw new Error("Line cannot be both horizontal and vertical.")
    }

    if (opts.horizontal && y2 !== undefined && y2 !== y1) {
      throw new Error(
        `Horizontal line requires matching y1/y2 when both are provided. Got y1=${y1}, y2=${y2}.`,
      )
    }

    if (opts.vertical && x2 !== undefined && x2 !== x1) {
      throw new Error(
        `Vertical line requires matching x1/x2 when both are provided. Got x1=${x1}, x2=${x2}.`,
      )
    }

    if (opts.horizontal) {
      if (x2 === undefined && opts.length !== undefined) {
        x2 = x1 + opts.length
      }
      y2 = y1
    }

    if (opts.vertical) {
      x2 = x1
      if (y2 === undefined) {
        y2 = y1 + (opts.length ?? 1)
      }
    }

    x2 ??= x1 + 1
    y2 ??= y1

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

    if (opts.horizontal) {
      this._internal.push(new HorizontalLine(start, end))
    }

    if (opts.vertical) {
      this._internal.push(new VerticalLine(start, end))
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
