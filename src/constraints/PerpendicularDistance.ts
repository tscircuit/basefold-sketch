import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"

type EdgeSelector = "left" | "top" | "right" | "bottom"

function parseEdgeRef(ref: string): {
  shapeName: string
  edge: EdgeSelector
  point1: string
  point2: string
} {
  const dot = ref.indexOf(".")
  if (dot === -1) {
    throw new Error(
      `Invalid edge ref "${ref}". Expected "ShapeName.edge" where edge is left, top, right, or bottom.`,
    )
  }

  const shapeName = ref.slice(0, dot)
  const edge = ref.slice(dot + 1)

  switch (edge) {
    case "left":
      return {
        shapeName,
        edge,
        point1: `${shapeName}.topLeft`,
        point2: `${shapeName}.bottomLeft`,
      }
    case "top":
      return {
        shapeName,
        edge,
        point1: `${shapeName}.topLeft`,
        point2: `${shapeName}.topRight`,
      }
    case "right":
      return {
        shapeName,
        edge,
        point1: `${shapeName}.topRight`,
        point2: `${shapeName}.bottomRight`,
      }
    case "bottom":
      return {
        shapeName,
        edge,
        point1: `${shapeName}.bottomLeft`,
        point2: `${shapeName}.bottomRight`,
      }
    default:
      throw new Error(
        `Invalid edge selector "${edge}" in "${ref}". Expected one of: left, top, right, bottom.`,
      )
  }
}

export class PerpendicularDistance implements Constraint {
  readonly edge1: string
  readonly edge2: string
  readonly distance: number

  constructor(opts: { edge1: string; edge2: string; distance: number }) {
    if (!Number.isFinite(opts.distance) || opts.distance <= 0) {
      throw new Error("PerpendicularDistance must be a positive finite number.")
    }

    this.edge1 = opts.edge1
    this.edge2 = opts.edge2
    this.distance = opts.distance
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const e1 = parseEdgeRef(this.edge1)
    const e2 = parseEdgeRef(this.edge2)
    const a1 = ctx.resolvePoint(e1.point1)
    const a2 = ctx.resolvePoint(e1.point2)
    const b1 = ctx.resolvePoint(e2.point1)
    const b2 = ctx.resolvePoint(e2.point2)
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
        const b2i = b2.__varIndex!

        const ux = vars[a2i] - vars[a1i]
        const uy = vars[a2i + 1] - vars[a1i + 1]

        const m1x = (vars[a1i] + vars[a2i]) / 2
        const m1y = (vars[a1i + 1] + vars[a2i + 1]) / 2
        const m2x = (vars[b1i] + vars[b2i]) / 2
        const m2y = (vars[b1i + 1] + vars[b2i + 1]) / 2

        const wx = m2x - m1x
        const wy = m2y - m1y

        return wx * ux + wy * uy
      },
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!

        const m1x = (vars[a1i] + vars[a2i]) / 2
        const m1y = (vars[a1i + 1] + vars[a2i + 1]) / 2
        const m2x = (vars[b1i] + vars[b2i]) / 2
        const m2y = (vars[b1i + 1] + vars[b2i + 1]) / 2

        const wx = m2x - m1x
        const wy = m2y - m1y

        return wx * wx + wy * wy - d2
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const e1 = parseEdgeRef(this.edge1)
    const e2 = parseEdgeRef(this.edge2)
    const a1 = ctx.resolvePoint(e1.point1)
    const a2 = ctx.resolvePoint(e1.point2)
    const b1 = ctx.resolvePoint(e2.point1)
    const b2 = ctx.resolvePoint(e2.point2)

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
}
