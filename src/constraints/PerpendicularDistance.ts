import type { GraphicsObject } from "graphics-debug"
import type {
  BuildContext,
  Constraint,
  ConstraintGraphicsContext,
  ConstraintSvgContext,
  Residual,
} from "../core"
import { resolveShapeEdgeRef } from "../edge-refs"

export class PerpendicularDistance implements Constraint {
  readonly edge1: string
  readonly edge2: string
  readonly distance: number

  constructor(opts: { edge1: string; edge2: string; distance: number }) {
    if (!Number.isFinite(opts.distance) || opts.distance <= 0) {
      throw new Error("PerpendicularDistance must be a positive finite number.")
    }

    this.edge1 = opts.edge1
    this.edge2 = opts.edge2
    this.distance = opts.distance
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const e1 = resolveShapeEdgeRef(this.edge1, ctx.resolveShape)
    const e2 = resolveShapeEdgeRef(this.edge2, ctx.resolveShape)
    const a1 = ctx.resolvePoint(e1.point1Ref)
    const a2 = ctx.resolvePoint(e1.point2Ref)
    const b1 = ctx.resolvePoint(e2.point1Ref)
    const b2 = ctx.resolvePoint(e2.point2Ref)
    const d2 = this.distance * this.distance

    return [
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!

        const ux = vars[a2i] - vars[a1i]
        const uy = vars[a2i + 1] - vars[a1i + 1]
        const vx = vars[b2i] - vars[b1i]
        const vy = vars[b2i + 1] - vars[b1i + 1]

        return ux * vy - uy * vx
      },
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!

        const ux = vars[a2i] - vars[a1i]
        const uy = vars[a2i + 1] - vars[a1i + 1]

        const m1x = (vars[a1i] + vars[a2i]) / 2
        const m1y = (vars[a1i + 1] + vars[a2i + 1]) / 2
        const m2x = (vars[b1i] + vars[b2i]) / 2
        const m2y = (vars[b1i + 1] + vars[b2i + 1]) / 2

        const wx = m2x - m1x
        const wy = m2y - m1y

        return wx * ux + wy * uy
      },
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!

        const m1x = (vars[a1i] + vars[a2i]) / 2
        const m1y = (vars[a1i + 1] + vars[a2i + 1]) / 2
        const m2x = (vars[b1i] + vars[b2i]) / 2
        const m2y = (vars[b1i + 1] + vars[b2i + 1]) / 2

        const wx = m2x - m1x
        const wy = m2y - m1y

        return wx * wx + wy * wy - d2
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const e1 = resolveShapeEdgeRef(this.edge1, ctx.resolveShape)
    const e2 = resolveShapeEdgeRef(this.edge2, ctx.resolveShape)
    const a1 = ctx.resolvePoint(e1.point1Ref)
    const a2 = ctx.resolvePoint(e1.point2Ref)
    const b1 = ctx.resolvePoint(e2.point1Ref)
    const b2 = ctx.resolvePoint(e2.point2Ref)

    const m1x = (a1.x + a2.x) / 2
    const m1y = (a1.y + a2.y) / 2
    const m2x = (b1.x + b2.x) / 2
    const m2y = (b1.y + b2.y) / 2

    const x1 = ctx.transform.x(m1x)
    const y1 = ctx.transform.y(m1y)
    const x2 = ctx.transform.x(m2x)
    const y2 = ctx.transform.y(m2y)

    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e76f51" stroke-width="2" stroke-dasharray="5 4" /><text x="${tx}" y="${ty}" fill="#e76f51" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">${this.distance}</text>`
  }

  toGraphicsObject(ctx: ConstraintGraphicsContext): GraphicsObject {
    const e1 = resolveShapeEdgeRef(this.edge1, ctx.resolveShape)
    const e2 = resolveShapeEdgeRef(this.edge2, ctx.resolveShape)
    const a1 = ctx.resolvePoint(e1.point1Ref)
    const a2 = ctx.resolvePoint(e1.point2Ref)
    const b1 = ctx.resolvePoint(e2.point1Ref)
    const b2 = ctx.resolvePoint(e2.point2Ref)

    const m1x = (a1.x + a2.x) / 2
    const m1y = (a1.y + a2.y) / 2
    const m2x = (b1.x + b2.x) / 2
    const m2y = (b1.y + b2.y) / 2

    return {
      arrows: [
        {
          start: { x: m1x, y: m1y },
          end: { x: m2x, y: m2y },
          doubleSided: true,
          color: "#e76f51",
          inlineLabel: String(this.distance),
        },
      ],
    }
  }
}
