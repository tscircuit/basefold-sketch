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
import { FixedSegmentLength } from "../constraints/FixedSegmentLength"
import { HorizontalLine } from "../constraints/HorizontalLine"
import { VerticalLine } from "../constraints/VerticalLine"
import { Oval_toGraphicsObject } from "./Oval_toGraphicsObject"
import { Oval_getBounds, Oval_toSvg } from "./Oval_toSvg"

export class Oval implements Shape {
  private static readonly emptyEdges: Record<never, EdgeReferenceDefinition> =
    defineShapeEdges({})

  name: string
  readonly points: Record<"center" | "radiusX" | "radiusY", Point>
  readonly refs: Record<"center" | "radiusX" | "radiusY", string>
  readonly edges: Record<never, EdgeReferenceDefinition> = Oval.emptyEdges
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
    this.refs = definePointRefs(this.name, this.points, this.edges)

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
    return Oval_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return Oval_toGraphicsObject(this.name, this.points)
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    return Oval_getBounds(this.points)
  }
}
