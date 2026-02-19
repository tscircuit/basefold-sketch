import type { GraphicsObject } from "graphics-debug"
import type {
  Constraint,
  EdgeReferenceDefinition,
  Point,
  Shape,
  SvgTransform,
} from "../../core"
import { Point as SketchPoint } from "../../core"
import { defineShapeEdges } from "../../edge-refs"
import { definePointRefs } from "../../point-refs"
import { FixedPointCoordinates } from "../constraints/FixedPointCoordinates"
import { Arc_toGraphicsObject } from "./Arc_toGraphicsObject"
import { Arc_getBounds, Arc_toSvg } from "./Arc_toSvg"

export interface ArcOptions {
  name?: string
  cx?: number
  cy?: number
  radius?: number
  startAngleDeg?: number
  endAngleDeg?: number
  clockwise?: boolean
}

type ArcPointName = "center" | "start" | "end"
type ArcEdgeName = "segment"
type ArcRefName = ArcPointName | ArcEdgeName

export class Arc implements Shape {
  private static nextAutoNameId = 1

  name: string
  readonly points: Record<ArcPointName, Point>
  readonly refs: Record<ArcRefName, string>
  readonly edges: Record<ArcEdgeName, EdgeReferenceDefinition> =
    defineShapeEdges({
      segment: {
        point1: "start",
        point2: "end",
      },
    })
  private _internal: Constraint[]
  private clockwise: boolean

  constructor(opts: ArcOptions = {}) {
    if (opts.name !== undefined && !opts.name) {
      throw new Error("Arc requires a non-empty name.")
    }

    this.name = opts.name ?? `Arc${Arc.nextAutoNameId++}`

    const cx = opts.cx ?? 0
    const cy = opts.cy ?? 0
    const radius = opts.radius ?? 1
    const startAngleDeg = opts.startAngleDeg ?? 0
    const endAngleDeg = opts.endAngleDeg ?? 90

    if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
      throw new Error("Arc center coordinates must be finite numbers.")
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error(
        `Arc radius must be a positive finite number. Got: ${radius}`,
      )
    }

    if (!Number.isFinite(startAngleDeg) || !Number.isFinite(endAngleDeg)) {
      throw new Error("Arc start and end angles must be finite numbers.")
    }

    if (opts.clockwise !== undefined && typeof opts.clockwise !== "boolean") {
      throw new Error("Arc clockwise flag must be a boolean.")
    }

    if (startAngleDeg === endAngleDeg) {
      throw new Error("Arc start and end angles must differ.")
    }

    this.clockwise = opts.clockwise ?? false

    const startAngle = (startAngleDeg * Math.PI) / 180
    const endAngle = (endAngleDeg * Math.PI) / 180

    const center = new SketchPoint(cx, cy)
    const start = new SketchPoint(
      cx + radius * Math.cos(startAngle),
      cy + radius * Math.sin(startAngle),
    )
    const end = new SketchPoint(
      cx + radius * Math.cos(endAngle),
      cy + radius * Math.sin(endAngle),
    )

    this.points = { center, start, end }
    this.refs = definePointRefs(this.name, this.points, this.edges)
    this._internal = [
      new FixedPointCoordinates(center, center.x, center.y),
      new FixedPointCoordinates(start, start.x, start.y),
      new FixedPointCoordinates(end, end.x, end.y),
    ]
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return Arc_toSvg(this.points, this.clockwise, t)
  }

  toGraphicsObject(): GraphicsObject {
    return Arc_toGraphicsObject(this.name, this.points, this.clockwise)
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    return Arc_getBounds(this.points, this.clockwise)
  }
}
