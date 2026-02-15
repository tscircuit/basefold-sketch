import type {
  BuildContext,
  Constraint,
  ConstraintSvgContext,
  Residual,
} from "../core"
import { computeInteriorUnitNormal, resolveShapeEdgeRef } from "../edge-refs"

function parallelAndMidpointResiduals(
  a1: { __varIndex: number | null },
  a2: { __varIndex: number | null },
  b1: { __varIndex: number | null },
  b2: { __varIndex: number | null },
): readonly [Residual, Residual] {
  const parallelResidual: Residual = (vars) => {
    const a1i = a1.__varIndex!
    const a2i = a2.__varIndex!
    const b1i = b1.__varIndex!
    const b2i = b2.__varIndex!

    const ux = vars[a2i] - vars[a1i]
    const uy = vars[a2i + 1] - vars[a1i + 1]
    const vx = vars[b2i] - vars[b1i]
    const vy = vars[b2i + 1] - vars[b1i + 1]

    return ux * vy - uy * vx
  }

  const midpointPerpendicularResidual: Residual = (vars) => {
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
  }

  return [parallelResidual, midpointPerpendicularResidual]
}

export class SpaceBetweenEdges implements Constraint {
  readonly edge1: string
  readonly edge2: string
  readonly distance: number

  constructor(opts: { edge1: string; edge2: string; distance: number }) {
    if (!opts.edge1) {
      throw new Error("SpaceBetweenEdges requires a non-empty edge1.")
    }
    if (!opts.edge2) {
      throw new Error("SpaceBetweenEdges requires a non-empty edge2.")
    }
    if (!Number.isFinite(opts.distance) || opts.distance < 0) {
      throw new Error(
        "SpaceBetweenEdges distance must be a non-negative finite number.",
      )
    }

    this.edge1 = opts.edge1
    this.edge2 = opts.edge2
    this.distance = opts.distance
  }

  buildResiduals(ctx: BuildContext): Residual[] {
    const e1 = resolveShapeEdgeRef(this.edge1, ctx.resolveShape)
    const e2 = resolveShapeEdgeRef(this.edge2, ctx.resolveShape)

    const a1 = ctx.resolvePoint(e1.point1Ref)
    const a2 = ctx.resolvePoint(e1.point2Ref)
    const b1 = ctx.resolvePoint(e2.point1Ref)
    const b2 = ctx.resolvePoint(e2.point2Ref)
    const [parallelResidual, midpointPerpendicularResidual] =
      parallelAndMidpointResiduals(a1, a2, b1, b2)

    if (!e1.interiorPointRef || !e2.interiorPointRef) {
      const d2 = this.distance * this.distance

      const unsignedDistanceResidual: Residual = (vars) => {
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
      }

      return [
        parallelResidual,
        midpointPerpendicularResidual,
        unsignedDistanceResidual,
      ]
    }

    const interior = ctx.resolvePoint(e1.interiorPointRef)

    return [
      parallelResidual,
      midpointPerpendicularResidual,
      (vars) => {
        const a1i = a1.__varIndex!
        const a2i = a2.__varIndex!
        const b1i = b1.__varIndex!
        const b2i = b2.__varIndex!
        const ii = interior.__varIndex!

        const a1x = vars[a1i]
        const a1y = vars[a1i + 1]
        const a2x = vars[a2i]
        const a2y = vars[a2i + 1]

        const ux = a2x - a1x
        const uy = a2y - a1y

        const m1x = (a1x + a2x) / 2
        const m1y = (a1y + a2y) / 2
        const interiorDx = vars[ii] - m1x
        const interiorDy = vars[ii + 1] - m1y

        const inward = computeInteriorUnitNormal(ux, uy, interiorDx, interiorDy)
        const outwardX = -inward.x
        const outwardY = -inward.y

        const m2x = (vars[b1i] + vars[b2i]) / 2
        const m2y = (vars[b1i + 1] + vars[b2i + 1]) / 2
        const wx = m2x - m1x
        const wy = m2y - m1y

        return wx * outwardX + wy * outwardY - this.distance
      },
    ]
  }

  toSvg(ctx: ConstraintSvgContext): string {
    const e1 = resolveShapeEdgeRef(this.edge1, ctx.resolveShape)
    const e2 = resolveShapeEdgeRef(this.edge2, ctx.resolveShape)
    const a1 = ctx.resolvePoint(e1.point1Ref)
    const a2 = ctx.resolvePoint(e1.point2Ref)
    const b1 = ctx.resolvePoint(e2.point1Ref)
    const b2 = ctx.resolvePoint(e2.point2Ref)

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

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2a9d8f" stroke-width="2" stroke-dasharray="7 4" /><text x="${tx}" y="${ty}" fill="#2a9d8f" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" text-anchor="middle">${this.distance}</text>`
  }
}
