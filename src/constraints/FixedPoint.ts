import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class FixedPoint implements Constraint {
  readonly point: string
  readonly x: number
  readonly y: number

  constructor(opts: { point: string; x: number; y: number }) {
    if (!Number.isFinite(opts.x) || !Number.isFinite(opts.y)) {
      throw new Error("FixedPoint x and y must be finite numbers.")
    }
    this.point = opts.point
    this.x = opts.x
    this.y = opts.y
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const p = ctx.resolvePoint(this.point)
    return [
      (vars) => vars[p.__varIndex!] - this.x,
      (vars) => vars[p.__varIndex! + 1] - this.y,
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const p = ctx.resolvePoint(this.point)
    const x = ctx.transform.x(p.x)
    const y = ctx.transform.y(p.y)
    const s = 6

    return `<g stroke="#c1121f" fill="none" stroke-width="2"><line x1="${x - s}" y1="${y - s}" x2="${x + s}" y2="${y + s}" /><line x1="${x + s}" y1="${y - s}" x2="${x - s}" y2="${y + s}" /></g><text x="${x}" y="${y - 14}" fill="#c1121f" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle" dominant-baseline="middle">fixed</text>`
  }
}
