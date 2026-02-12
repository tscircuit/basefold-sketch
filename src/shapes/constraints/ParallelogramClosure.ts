import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Point,
  Residual,
} from "../../core"

export class ParallelogramClosure implements Constraint {
  constructor(
    private tl: Point,
    private tr: Point,
    private bl: Point,
    private br: Point,
  ) {}

  buildResiduals(_ctx: BuildContext): Residual[] {
    const tl = this.tl
    const tr = this.tr
    const bl = this.bl
    const br = this.br

    return [
      (vars) => {
        const itl = tl.__varIndex!
        const itr = tr.__varIndex!
        const ibl = bl.__varIndex!
        const ibr = br.__varIndex!
        return vars[ibr] - (vars[itr] + vars[ibl] - vars[itl])
      },
      (vars) => {
        const itl = tl.__varIndex!
        const itr = tr.__varIndex!
        const ibl = bl.__varIndex!
        const ibr = br.__varIndex!
        return vars[ibr + 1] - (vars[itr + 1] + vars[ibl + 1] - vars[itl + 1])
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const tl = { x: ctx.transform.x(this.tl.x), y: ctx.transform.y(this.tl.y) }
    const br = { x: ctx.transform.x(this.br.x), y: ctx.transform.y(this.br.y) }
    const tr = { x: ctx.transform.x(this.tr.x), y: ctx.transform.y(this.tr.y) }
    const bl = { x: ctx.transform.x(this.bl.x), y: ctx.transform.y(this.bl.y) }

    return `<line x1="${tl.x}" y1="${tl.y}" x2="${br.x}" y2="${br.y}" stroke="#b0b0b0" stroke-width="1" stroke-dasharray="3 3" /><line x1="${tr.x}" y1="${tr.y}" x2="${bl.x}" y2="${bl.y}" stroke="#b0b0b0" stroke-width="1" stroke-dasharray="3 3" />`
  }
}
