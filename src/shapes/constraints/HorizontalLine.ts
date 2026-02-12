import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Point,
  Residual,
} from "../../core"

export class HorizontalLine implements Constraint {
  constructor(
    private p1: Point,
    private p2: Point,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const p1 = this.p1
    const p2 = this.p2
    return [(vars) => vars[p1.__varIndex! + 1] - vars[p2.__varIndex! + 1]]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const x1 = ctx.transform.x(this.p1.x)
    const y1 = ctx.transform.y(this.p1.y)
    const x2 = ctx.transform.x(this.p2.x)
    const y2 = ctx.transform.y(this.p2.y)
    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#457b9d" stroke-width="1.5" stroke-dasharray="4 3" /><text x="${tx}" y="${ty}" fill="#457b9d" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" text-anchor="middle">horizontal</text>`
  }
}
