import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class FixedX implements Constraint {
  readonly point: string
  readonly x: number

  constructor(opts: { point: string; x: number }) {
    if (!Number.isFinite(opts.x)) throw new Error("FixedX x must be finite.")
    this.point = opts.point
    this.x = opts.x
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const p = ctx.resolvePoint(this.point)
    return [(vars) => vars[p.__varIndex!] - this.x]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const p = ctx.resolvePoint(this.point)
    const x = ctx.transform.x(p.x)
    const y = ctx.transform.y(p.y)
    return `<line x1="${x}" y1="${y - 20}" x2="${x}" y2="${y + 20}" stroke="#c1121f" stroke-width="2" stroke-dasharray="4 3" /><text x="${x + 14}" y="${y - 10}" fill="#c1121f" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11">x fixed</text>`
  }
}
