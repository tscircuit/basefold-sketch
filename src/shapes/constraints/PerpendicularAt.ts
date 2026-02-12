import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Point,
  Residual,
} from "../../core"

const normalize = (x: number, y: number): { x: number; y: number } => {
  const mag = Math.hypot(x, y) || 1
  return { x: x / mag, y: y / mag }
}

export class PerpendicularAt implements Constraint {
  constructor(
    private a: Point,
    private b: Point,
    private c: Point,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const a = this.a
    const b = this.b
    const c = this.c

    return [
      (vars) => {
        const ia = a.__varIndex!
        const ib = b.__varIndex!
        const ic = c.__varIndex!
        const abx = vars[ib] - vars[ia]
        const aby = vars[ib + 1] - vars[ia + 1]
        const acx = vars[ic] - vars[ia]
        const acy = vars[ic + 1] - vars[ia + 1]
        return abx * acx + aby * acy
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const a = { x: ctx.transform.x(this.a.x), y: ctx.transform.y(this.a.y) }
    const b = { x: ctx.transform.x(this.b.x), y: ctx.transform.y(this.b.y) }
    const c = { x: ctx.transform.x(this.c.x), y: ctx.transform.y(this.c.y) }

    const u = normalize(b.x - a.x, b.y - a.y)
    const v = normalize(c.x - a.x, c.y - a.y)
    const size = 10

    const p1 = { x: a.x + u.x * size, y: a.y + u.y * size }
    const p2 = { x: p1.x + v.x * size, y: p1.y + v.y * size }
    const p3 = { x: a.x + v.x * size, y: a.y + v.y * size }

    return `<polyline points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" fill="none" stroke="#7a7a7a" stroke-width="1.5" />`
  }
}
