import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Point,
  Residual,
} from "../../core"

export class ParallelLines implements Constraint {
  constructor(
    private a1: Point,
    private a2: Point,
    private b1: Point,
    private b2: Point,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const a1 = this.a1
    const a2 = this.a2
    const b1 = this.b1
    const b2 = this.b2

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
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const a1x = ctx.transform.x(this.a1.x)
    const a1y = ctx.transform.y(this.a1.y)
    const a2x = ctx.transform.x(this.a2.x)
    const a2y = ctx.transform.y(this.a2.y)
    const b1x = ctx.transform.x(this.b1.x)
    const b1y = ctx.transform.y(this.b1.y)
    const b2x = ctx.transform.x(this.b2.x)
    const b2y = ctx.transform.y(this.b2.y)

    const tx = (a1x + a2x + b1x + b2x) / 4
    const ty = (a1y + a2y + b1y + b2y) / 4 - 10

    return `<line x1="${a1x}" y1="${a1y}" x2="${a2x}" y2="${a2y}" stroke="#457b9d" stroke-width="1.5" stroke-dasharray="4 3" /><line x1="${b1x}" y1="${b1y}" x2="${b2x}" y2="${b2y}" stroke="#457b9d" stroke-width="1.5" stroke-dasharray="4 3" /><text x="${tx}" y="${ty}" fill="#457b9d" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" text-anchor="middle">parallel</text>`
  }
}
