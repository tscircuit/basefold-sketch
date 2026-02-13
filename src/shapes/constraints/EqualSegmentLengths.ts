import type { BuildContext, Constraint, Point, Residual } from "../../core"

export class EqualSegmentLengths implements Constraint {
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

        const adx = vars[a2i] - vars[a1i]
        const ady = vars[a2i + 1] - vars[a1i + 1]
        const bdx = vars[b2i] - vars[b1i]
        const bdy = vars[b2i + 1] - vars[b1i + 1]

        return adx * adx + ady * ady - (bdx * bdx + bdy * bdy)
      },
    ]
  }
}
