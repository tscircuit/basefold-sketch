import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class Coincident implements Constraint {
  readonly point1: string
  readonly point2: string

  constructor(opts: { point1: string; point2: string }) {
    this.point1 = opts.point1
    this.point2 = opts.point2
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const p1 = ctx.resolvePoint(this.point1)
    const p2 = ctx.resolvePoint(this.point2)

    return [
      (vars) => vars[p1.__varIndex!] - vars[p2.__varIndex!],
      (vars) => vars[p1.__varIndex! + 1] - vars[p2.__varIndex! + 1],
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

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a86ff" stroke-width="2" stroke-dasharray="4 3" /><circle cx="${x1}" cy="${y1}" r="4" fill="none" stroke="#3a86ff" stroke-width="2" /><text x="${tx}" y="${ty}" fill="#3a86ff" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">coincident</text>`
  }
}
