import type { BuildContext, Constraint, Point, Residual } from "../../core"

export class FixedPointCoordinates implements Constraint {
  constructor(
    private point: Point,
    private x: number,
    private y: number,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const point = this.point
    const x = this.x
    const y = this.y

    return [
      (vars) => vars[point.__varIndex!] - x,
      (vars) => vars[point.__varIndex! + 1] - y,
    ]
  }
}
