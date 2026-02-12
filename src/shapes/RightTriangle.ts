import type { Constraint, Point, Shape, SvgTransform } from "../core"
import { Point as SketchPoint } from "../core"
import { FixedSegmentLength } from "./constraints/FixedSegmentLength"
import { PerpendicularAt } from "./constraints/PerpendicularAt"

export interface RightTriangleOptions {
  name: string
  x?: number
  y?: number
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
  private _internal: Constraint[]

  constructor(opts: RightTriangleOptions) {
    if (!opts.name) {
      throw new Error("RightTriangle requires a non-empty name.")
    }

    this.name = opts.name

    const x = opts.x ?? 0
    const y = opts.y ?? 0

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error("RightTriangle x and y must be finite numbers.")
    }

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

    const pointAB = new SketchPoint(x, y)
    const pointAC = new SketchPoint(x + baseInit, y)
    const pointBC = new SketchPoint(x, y + altitudeInit)

    this.points = { pointAB, pointAC, pointBC }
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
    const pointAB = this.points.pointAB
    const pointAC = this.points.pointAC
    const pointBC = this.points.pointBC

    const pts = [
      `${t.x(pointAB.x)},${t.y(pointAB.y)}`,
      `${t.x(pointAC.x)},${t.y(pointAC.y)}`,
      `${t.x(pointBC.x)},${t.y(pointBC.y)}`,
    ].join(" ")

    return `<polygon points="${pts}" />`
  }
}
