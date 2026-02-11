import type { BuildContext, Constraint, Residual } from "../core"

export class Distance implements Constraint {
  readonly point1: string
  readonly point2: string
  readonly distance: number

  constructor(opts: { point1: string; point2: string; distance: number }) {
    if (!Number.isFinite(opts.distance) || opts.distance <= 0) {
      throw new Error("Distance must be a positive finite number.")
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
        // Squared distance residual (avoids sqrt).
        return dx * dx + dy * dy - d2
      },
    ]
  }
}
