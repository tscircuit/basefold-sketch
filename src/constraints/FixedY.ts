import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class FixedY implements Constraint {
  readonly point: string
  readonly y: number

  constructor(opts: { point: string; y: number }) {
    if (!Number.isFinite(opts.y)) throw new Error("FixedY y must be finite.")
    this.point = opts.point
    this.y = opts.y
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const p = ctx.resolvePoint(this.point)
    return [(vars) => vars[p.__varIndex! + 1] - this.y]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const p = ctx.resolvePoint(this.point)
    const x = ctx.transform.x(p.x)
    const y = ctx.transform.y(p.y)
    return `<line x1="${x - 20}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="#c1121f" stroke-width="2" stroke-dasharray="4 3" /><text x="${x + 14}" y="${y - 10}" fill="#c1121f" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11">y fixed</text>`
  }
}
