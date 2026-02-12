import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

export class Tangent implements Constraint {
  readonly line: string
  readonly circle: string

  constructor(opts: { line: string; circle: string }) {
    this.line = opts.line
    this.circle = opts.circle
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const lineStart = ctx.resolvePoint(`${this.line}.start`)
    const lineEnd = ctx.resolvePoint(`${this.line}.end`)
    const circleCenter = ctx.resolvePoint(`${this.circle}.center`)
    const circleRadiusPoint = ctx.resolvePoint(`${this.circle}.radius`)

    return [
      (vars) => {
        const si = lineStart.__varIndex!
        const ei = lineEnd.__varIndex!
        const ci = circleCenter.__varIndex!
        const ri = circleRadiusPoint.__varIndex!

        const x1 = vars[si]
        const y1 = vars[si + 1]
        const x2 = vars[ei]
        const y2 = vars[ei + 1]
        const cx = vars[ci]
        const cy = vars[ci + 1]
        const rx = vars[ri]
        const ry = vars[ri + 1]

        const dx = x2 - x1
        const dy = y2 - y1
        const ux = cx - x1
        const uy = cy - y1
        const cross = ux * dy - uy * dx
        const lineLengthSquared = dx * dx + dy * dy
        const radiusDx = rx - cx
        const radiusDy = ry - cy
        const radiusSquared = radiusDx * radiusDx + radiusDy * radiusDy

        return cross * cross - radiusSquared * lineLengthSquared
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const lineStart = ctx.resolvePoint(`${this.line}.start`)
    const lineEnd = ctx.resolvePoint(`${this.line}.end`)

    const x1 = ctx.transform.x(lineStart.x)
    const y1 = ctx.transform.y(lineStart.y)
    const x2 = ctx.transform.x(lineEnd.x)
    const y2 = ctx.transform.y(lineEnd.y)
    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<text x="${tx}" y="${ty}" fill="#f4a261" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">tangent</text>`
  }
}
