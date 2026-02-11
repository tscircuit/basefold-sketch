import type { BuildContext, Constraint, Residual } from "../core"

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
}

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
}

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
}
