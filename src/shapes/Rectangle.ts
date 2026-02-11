import type {
  BuildContext,
  Constraint,
  Point,
  Residual,
  Shape,
  SvgTransform,
} from "../core"
import { Point as SketchPoint } from "../core"

class ParallelogramClosure implements Constraint {
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
}

class PerpendicularAt implements Constraint {
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
}

export class Rectangle implements Shape {
  name: string
  readonly points: Record<string, Point>
  private _internal: Constraint[]

  constructor(opts: {
    name: string
    x?: number
    y?: number
    width?: number
    height?: number
  }) {
    this.name = opts.name

    const x = opts.x ?? 0
    const y = opts.y ?? 0
    const w = opts.width ?? 1
    const h = opts.height ?? 1

    const topLeft = new SketchPoint(x, y)
    const topRight = new SketchPoint(x + w, y)
    const bottomLeft = new SketchPoint(x, y + h)
    const bottomRight = new SketchPoint(x + w, y + h)

    this.points = { topLeft, topRight, bottomLeft, bottomRight }

    this._internal = [
      new ParallelogramClosure(topLeft, topRight, bottomLeft, bottomRight),
      new PerpendicularAt(topLeft, topRight, bottomLeft),
    ]
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    const tl = this.points.topLeft
    const tr = this.points.topRight
    const br = this.points.bottomRight
    const bl = this.points.bottomLeft

    const pts = [
      `${t.x(tl.x)},${t.y(tl.y)}`,
      `${t.x(tr.x)},${t.y(tr.y)}`,
      `${t.x(br.x)},${t.y(br.y)}`,
      `${t.x(bl.x)},${t.y(bl.y)}`,
    ].join(" ")

    return `<polygon points="${pts}" />`
  }
}
