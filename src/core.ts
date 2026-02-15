import type { GraphicsObject } from "graphics-debug"

export class Point {
  // Index into the solver variable vector (x at i, y at i+1).
  public __varIndex: number | null = null

  constructor(
    public x: number,
    public y: number,
  ) {}
}

export type Residual = (vars: Float64Array) => number

export interface Vector2 {
  x: number
  y: number
}

export interface EdgeReferenceDefinition {
  point1: string
  point2: string
  interiorPoint?: string
}

export interface BuildContext {
  resolvePoint(ref: string): Point
  resolveShape(name: string): Shape
}

export interface ConstraintSvgContext {
  resolvePoint(ref: string): Point
  resolveShape(name: string): Shape
  transform: SvgTransform
}

export interface Constraint {
  // Returns one or more scalar residual equations f(vars) = 0.
  buildResiduals(ctx: BuildContext): Residual[]

  // Emits SVG elements representing this constraint (optional).
  toSvg?(ctx: ConstraintSvgContext): string
}

export interface SvgTransform {
  x(x: number): number
  y(y: number): number
}

export interface Shape {
  name: string
  readonly points: Record<string, Point>
  readonly edges: Record<string, EdgeReferenceDefinition>

  // Constraints that define/maintain the shape's intrinsic geometry.
  internalConstraints(): Constraint[]

  // Emits SVG elements (no outer <svg> wrapper).
  toSvg(t: SvgTransform): string

  // Emits graphics-object primitives.
  toGraphicsObject(): GraphicsObject

  // Optional geometric bounds used for SVG framing.
  getBounds?(): {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}
