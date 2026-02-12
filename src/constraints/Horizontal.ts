import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class Horizontal implements Constraint {
  readonly line: string

  constructor(opts: { line: string }) {
    if (!opts.line) {
      throw new Error("Horizontal constraint requires a non-empty line name.")
    }
    this.line = opts.line
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const start = ctx.resolvePoint(`${this.line}.start`)
    const end = ctx.resolvePoint(`${this.line}.end`)

    return [(vars) => vars[start.__varIndex! + 1] - vars[end.__varIndex! + 1]]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const start = ctx.resolvePoint(`${this.line}.start`)
    const end = ctx.resolvePoint(`${this.line}.end`)

    const x1 = ctx.transform.x(start.x)
    const y1 = ctx.transform.y(start.y)
    const x2 = ctx.transform.x(end.x)
    const y2 = ctx.transform.y(end.y)
    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#457b9d" stroke-width="1.5" stroke-dasharray="4 3" /><text x="${tx}" y="${ty}" fill="#457b9d" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">horizontal</text>`
  }
}
