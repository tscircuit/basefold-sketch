import type { GraphicsObject } from "graphics-debug"
import type {
  BuildContext,
  Constraint,
  ConstraintGraphicsContext,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class PointToPointDistance implements Constraint {
  readonly point1: string
  readonly point2: string
  readonly distance: number

  constructor(opts: { point1: string; point2: string; distance: number }) {
    if (!Number.isFinite(opts.distance) || opts.distance <= 0) {
      throw new Error("PointToPointDistance must be a positive finite number.")
    }
    this.point1 = opts.point1
    this.point2 = opts.point2
    this.distance = opts.distance
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const p1 = ctx.resolvePoint(this.point1)
    const p2 = ctx.resolvePoint(this.point2)
    const d2 = this.distance * this.distance

    return [
      (vars) => {
        const i1 = p1.__varIndex!
        const i2 = p2.__varIndex!
        const dx = vars[i1] - vars[i2]
        const dy = vars[i1 + 1] - vars[i2 + 1]
        return dx * dx + dy * dy - d2
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const p1 = ctx.resolvePoint(this.point1)
    const p2 = ctx.resolvePoint(this.point2)
    const x1 = ctx.transform.x(p1.x)
    const y1 = ctx.transform.y(p1.y)
    const x2 = ctx.transform.x(p2.x)
    const y2 = ctx.transform.y(p2.y)
    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e76f51" stroke-width="2" stroke-dasharray="5 4" /><text x="${tx}" y="${ty}" fill="#e76f51" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">${this.distance}</text>`
  }

  toGraphicsObject(ctx: ConstraintGraphicsContext): GraphicsObject {
    const p1 = ctx.resolvePoint(this.point1)
    const p2 = ctx.resolvePoint(this.point2)

    return {
      arrows: [
        {
          start: { x: p1.x, y: p1.y },
          end: { x: p2.x, y: p2.y },
          doubleSided: true,
          color: "#e76f51",
          inlineLabel: String(this.distance),
        },
      ],
    }
  }
}
