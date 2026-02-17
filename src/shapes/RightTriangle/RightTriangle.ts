import type { GraphicsObject } from "graphics-debug"
import type { Constraint, Point, Shape, SvgTransform } from "../../core"
import { Point as SketchPoint } from "../../core"
import { defineShapeEdges } from "../../edge-refs"
import { definePointRefs } from "../../point-refs"
import { FixedSegmentLength } from "../constraints/FixedSegmentLength"
import { PerpendicularAt } from "../constraints/PerpendicularAt"
import { RightTriangle_toGraphicsObject } from "./RightTriangle_toGraphicsObject"
import { RightTriangle_toSvg } from "./RightTriangle_toSvg"

export interface RightTriangleOptions {
  name: string
  baseLength?: number
  altitudeLength?: number
  hypotenuseLength?: number
  aLength?: number
  bLength?: number
  cLength?: number
  abLength?: number
  acLength?: number
  bcLength?: number
}

type LengthAlias =
  | "baseLength"
  | "altitudeLength"
  | "hypotenuseLength"
  | "aLength"
  | "bLength"
  | "cLength"
  | "abLength"
  | "acLength"
  | "bcLength"

function approxEqual(a: number, b: number): boolean {
  const scale = Math.max(1, Math.abs(a), Math.abs(b))
  return Math.abs(a - b) <= Number.EPSILON * 16 * scale
}

function resolveEdgeLength(
  opts: RightTriangleOptions,
  edgeLabel: "base" | "altitude" | "hypotenuse",
  aliases: ReadonlyArray<LengthAlias>,
): number | undefined {
  let chosen: number | undefined

  for (const alias of aliases) {
    const raw = opts[alias]
    if (raw === undefined) continue

    if (!Number.isFinite(raw) || raw <= 0) {
      throw new Error(
        `RightTriangle ${edgeLabel} length must be a positive finite number. Got: ${raw}`,
      )
    }

    if (chosen !== undefined && !approxEqual(chosen, raw)) {
      throw new Error(`Conflicting length options for edge "${edgeLabel}".`)
    }

    chosen = raw
  }

  return chosen
}

function ensureHypotenuseCompatibility(
  legA: number,
  legB: number,
  hypotenuse: number,
): void {
  const lhs = legA * legA + legB * legB
  const rhs = hypotenuse * hypotenuse
  const tol = 1e-8 * Math.max(1, lhs, rhs)

  if (Math.abs(lhs - rhs) > tol) {
    throw new Error(
      `RightTriangle side lengths are inconsistent: base=${legA}, altitude=${legB}, hypotenuse=${hypotenuse}.`,
    )
  }
}

export class RightTriangle implements Shape {
  name: string
  readonly points: Record<string, Point>
  readonly refs: Record<string, string>
  readonly edges = defineShapeEdges({
    base: {
      point1: "pointAB",
      point2: "pointAC",
      interiorPoint: "pointBC",
    },
    altitude: {
      point1: "pointAB",
      point2: "pointBC",
      interiorPoint: "pointAC",
    },
    hypotenuse: {
      point1: "pointAC",
      point2: "pointBC",
      interiorPoint: "pointAB",
    },
    a: {
      point1: "pointAB",
      point2: "pointAC",
      interiorPoint: "pointBC",
    },
    b: {
      point1: "pointAB",
      point2: "pointBC",
      interiorPoint: "pointAC",
    },
    c: {
      point1: "pointAC",
      point2: "pointBC",
      interiorPoint: "pointAB",
    },
    ab: {
      point1: "pointAB",
      point2: "pointAC",
      interiorPoint: "pointBC",
    },
    ac: {
      point1: "pointAB",
      point2: "pointBC",
      interiorPoint: "pointAC",
    },
    bc: {
      point1: "pointAC",
      point2: "pointBC",
      interiorPoint: "pointAB",
    },
  })
  private _internal: Constraint[]

  constructor(opts: RightTriangleOptions) {
    if (!opts.name) {
      throw new Error("RightTriangle requires a non-empty name.")
    }

    if ("x" in opts || "y" in opts) {
      throw new Error(
        'RightTriangle does not accept "x" or "y". Use constraints (for example FixedPoint on pointAB) to position the shape.',
      )
    }

    this.name = opts.name

    const baseLength = resolveEdgeLength(opts, "base", [
      "baseLength",
      "aLength",
      "abLength",
    ])
    const altitudeLength = resolveEdgeLength(opts, "altitude", [
      "altitudeLength",
      "bLength",
      "acLength",
    ])
    const hypotenuseLength = resolveEdgeLength(opts, "hypotenuse", [
      "hypotenuseLength",
      "cLength",
      "bcLength",
    ])

    if (
      baseLength !== undefined &&
      altitudeLength !== undefined &&
      hypotenuseLength !== undefined
    ) {
      ensureHypotenuseCompatibility(
        baseLength,
        altitudeLength,
        hypotenuseLength,
      )
    }

    let baseInit = baseLength ?? 1
    let altitudeInit = altitudeLength ?? 1

    if (
      baseLength === undefined &&
      altitudeLength !== undefined &&
      hypotenuseLength !== undefined
    ) {
      const remaining = hypotenuseLength ** 2 - altitudeLength ** 2
      if (remaining <= 0) {
        throw new Error(
          `RightTriangle hypotenuse (${hypotenuseLength}) must be longer than altitude (${altitudeLength}).`,
        )
      }
      baseInit = Math.sqrt(remaining)
    }

    if (
      altitudeLength === undefined &&
      baseLength !== undefined &&
      hypotenuseLength !== undefined
    ) {
      const remaining = hypotenuseLength ** 2 - baseLength ** 2
      if (remaining <= 0) {
        throw new Error(
          `RightTriangle hypotenuse (${hypotenuseLength}) must be longer than base (${baseLength}).`,
        )
      }
      altitudeInit = Math.sqrt(remaining)
    }

    if (
      baseLength === undefined &&
      altitudeLength === undefined &&
      hypotenuseLength !== undefined
    ) {
      baseInit = hypotenuseLength / Math.SQRT2
      altitudeInit = baseInit
    }

    const pointAB = new SketchPoint(0, 0)
    const pointAC = new SketchPoint(baseInit, 0)
    const pointBC = new SketchPoint(0, altitudeInit)

    this.points = { pointAB, pointAC, pointBC }
    this.refs = definePointRefs(this.name, this.points, this.edges)
    this._internal = [new PerpendicularAt(pointAB, pointAC, pointBC)]

    if (baseLength !== undefined) {
      this._internal.push(new FixedSegmentLength(pointAB, pointAC, baseLength))
    }
    if (altitudeLength !== undefined) {
      this._internal.push(
        new FixedSegmentLength(pointAB, pointBC, altitudeLength),
      )
    }
    if (hypotenuseLength !== undefined) {
      this._internal.push(
        new FixedSegmentLength(pointAC, pointBC, hypotenuseLength),
      )
    }
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return RightTriangle_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return RightTriangle_toGraphicsObject(this.name, this.points)
  }
}
