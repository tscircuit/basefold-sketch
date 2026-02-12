import type { BuildContext, Constraint, Point, Residual } from "../../core"

export class FixedSegmentLength implements Constraint {
  constructor(
    private p1: Point,
    private p2: Point,
    private distance: number,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const p1 = this.p1
    const p2 = this.p2
    const d2 = this.distance * this.distance

    return [
      (vars) => {
        const i1 = p1.__varIndex!
        const i2 = p2.__varIndex!
        const dx = vars[i1] - vars[i2]
        const dy = vars[i1 + 1] - vars[i2 + 1]
        return dx * dx + dy * dy - d2
      },
    ]
  }
}
