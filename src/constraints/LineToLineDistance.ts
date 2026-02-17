import type { GraphicsObject } from "graphics-debug"
import type {
  BuildContext,
  Constraint,
  ConstraintGraphicsContext,
  ConstraintSvgContext,
  Residual,
} from "../core"

type EdgeSelector =
  | "left"
  | "top"
  | "right"
  | "bottom"
  | "base"
  | "altitude"
  | "hypotenuse"
  | "a"
  | "b"
  | "c"
  | "ab"
  | "ac"
  | "bc"
  | "shortBase"
  | "longBase"
  | "leg1"
  | "leg2"
  | "bottommostLeg"
  | "leftmostLeg"
  | "rightmostLeg"
  | "topmostLeg"
  | "bottommostBase"
  | "leftmostBase"
  | "rightmostBase"
  | "topmostBase"

const edgePointRefs: Record<EdgeSelector, readonly [string, string]> = {
  left: ["topLeft", "bottomLeft"],
  top: ["topLeft", "topRight"],
  right: ["topRight", "bottomRight"],
  bottom: ["bottomLeft", "bottomRight"],
  base: ["pointAB", "pointAC"],
  altitude: ["pointAB", "pointBC"],
  hypotenuse: ["pointAC", "pointBC"],
  a: ["pointAB", "pointAC"],
  b: ["pointAB", "pointBC"],
  c: ["pointAC", "pointBC"],
  ab: ["pointAB", "pointAC"],
  ac: ["pointAB", "pointBC"],
  bc: ["pointAC", "pointBC"],
  shortBase: ["shortBase.start", "shortBase.end"],
  longBase: ["longBase.start", "longBase.end"],
  leg1: ["leg1.start", "leg1.end"],
  leg2: ["leg2.start", "leg2.end"],
  bottommostLeg: ["bottommostLeg.start", "bottommostLeg.end"],
  leftmostLeg: ["leftmostLeg.start", "leftmostLeg.end"],
  rightmostLeg: ["rightmostLeg.start", "rightmostLeg.end"],
  topmostLeg: ["topmostLeg.start", "topmostLeg.end"],
  bottommostBase: ["bottommostBase.start", "bottommostBase.end"],
  leftmostBase: ["leftmostBase.start", "leftmostBase.end"],
  rightmostBase: ["rightmostBase.start", "rightmostBase.end"],
  topmostBase: ["topmostBase.start", "topmostBase.end"],
}

function resolveLineRef(ref: string): { point1: string; point2: string } {
  const dot = ref.indexOf(".")
  if (dot === -1) {
    return {
      point1: `${ref}.start`,
      point2: `${ref}.end`,
    }
  }

  const shapeName = ref.slice(0, dot)
  const selector = ref.slice(dot + 1)
  const edge = edgePointRefs[selector as EdgeSelector]

  if (edge) {
    return {
      point1: `${shapeName}.${edge[0]}`,
      point2: `${shapeName}.${edge[1]}`,
    }
  }

  return {
    point1: `${shapeName}.${selector}.start`,
    point2: `${shapeName}.${selector}.end`,
  }
}

export class LineToLineDistance implements Constraint {
  readonly line1: string
  readonly line2: string
  readonly distance: number

  constructor(opts: { line1: string; line2: string; distance: number }) {
    if (!opts.line1) {
      throw new Error("LineToLineDistance requires a non-empty line1.")
    }
    if (!opts.line2) {
      throw new Error("LineToLineDistance requires a non-empty line2.")
    }
    if (!Number.isFinite(opts.distance) || opts.distance <= 0) {
      throw new Error("LineToLineDistance must be a positive finite number.")
    }

    this.line1 = opts.line1
    this.line2 = opts.line2
    this.distance = opts.distance
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const a = resolveLineRef(this.line1)
    const b = resolveLineRef(this.line2)
    const a1 = ctx.resolvePoint(a.point1)
    const a2 = ctx.resolvePoint(a.point2)
    const b1 = ctx.resolvePoint(b.point1)
    const b2 = ctx.resolvePoint(b.point2)
    const d2 = this.distance * this.distance

    return [
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!

        const ux = vars[a2i] - vars[a1i]
        const uy = vars[a2i + 1] - vars[a1i + 1]
        const vx = vars[b2i] - vars[b1i]
        const vy = vars[b2i + 1] - vars[b1i + 1]

        return ux * vy - uy * vx
      },
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const ux = vars[a2i] - vars[a1i]
        const uy = vars[a2i + 1] - vars[a1i + 1]
        const wx = vars[b1i] - vars[a1i]
        const wy = vars[b1i + 1] - vars[a1i + 1]

        const cross = ux * wy - uy * wx
        const uLen2 = ux * ux + uy * uy

        if (uLen2 === 0) {
          return -d2
        }

        return (cross * cross) / uLen2 - d2
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const a = resolveLineRef(this.line1)
    const b = resolveLineRef(this.line2)
    const a1 = ctx.resolvePoint(a.point1)
    const a2 = ctx.resolvePoint(a.point2)
    const b1 = ctx.resolvePoint(b.point1)
    const b2 = ctx.resolvePoint(b.point2)

    const m1x = (a1.x + a2.x) / 2
    const m1y = (a1.y + a2.y) / 2
    const m2x = (b1.x + b2.x) / 2
    const m2y = (b1.y + b2.y) / 2

    const x1 = ctx.transform.x(m1x)
    const y1 = ctx.transform.y(m1y)
    const x2 = ctx.transform.x(m2x)
    const y2 = ctx.transform.y(m2y)
    const tx = (x1 + x2) / 2
    const ty = (y1 + y2) / 2 - 10

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e76f51" stroke-width="2" stroke-dasharray="5 4" /><text x="${tx}" y="${ty}" fill="#e76f51" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">${this.distance}</text>`
  }

  toGraphicsObject(ctx: ConstraintGraphicsContext): GraphicsObject {
    const a = resolveLineRef(this.line1)
    const b = resolveLineRef(this.line2)
    const a1 = ctx.resolvePoint(a.point1)
    const a2 = ctx.resolvePoint(a.point2)
    const b1 = ctx.resolvePoint(b.point1)
    const b2 = ctx.resolvePoint(b.point2)

    const m1x = (a1.x + a2.x) / 2
    const m1y = (a1.y + a2.y) / 2
    const m2x = (b1.x + b2.x) / 2
    const m2y = (b1.y + b2.y) / 2

    return {
      arrows: [
        {
          start: { x: m1x, y: m1y },
          end: { x: m2x, y: m2y },
          doubleSided: true,
          color: "#e76f51",
          inlineLabel: String(this.distance),
        },
      ],
    }
  }
}
