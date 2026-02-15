import type { BuildContext, Constraint, Point, Residual, Shape } from "./core"
import { createGraphicsObjectFromSketch } from "./createGraphicsObjectFromSketch"
import { createSvgFromSketch } from "./createSvgFromSketch"
import { type SolveOptions, solveLM } from "./solver/lm"

function isShape(x: unknown): x is Shape {
  if (!x || typeof x !== "object") return false
  const v = x as Record<string, unknown>
  return (
    typeof v.name === "string" &&
    typeof v.points === "object" &&
    typeof v.internalConstraints === "function" &&
    typeof v.toSvg === "function" &&
    typeof v.toGraphicsObject === "function"
  )
}

function isConstraint(x: unknown): x is Constraint {
  if (!x || typeof x !== "object") return false
  const v = x as Record<string, unknown>
  return typeof v.buildResiduals === "function"
}

export class Sketch {
  private shapes = new Map<string, Shape>()
  private userConstraints: Constraint[] = []

  add(item: Shape | Constraint): this {
    if (isShape(item)) {
      if (!item.name) throw new Error("Shape must have a non-empty name.")
      if (this.shapes.has(item.name))
        throw new Error(`Shape "${item.name}" already exists.`)
      this.shapes.set(item.name, item)
      return this
    }

    if (isConstraint(item)) {
      this.userConstraints.push(item)
      return this
    }

    throw new Error("Unsupported item. Expected a Shape or Constraint.")
  }

  private resolvePoint(ref: string): Point {
    const dot = ref.indexOf(".")
    if (dot === -1)
      throw new Error(
        `Invalid point ref "${ref}". Expected "ShapeName.pointName".`,
      )

    const shapeName = ref.slice(0, dot)
    const pointName = ref.slice(dot + 1)

    const shape = this.shapes.get(shapeName)
    if (!shape)
      throw new Error(`Unknown shape "${shapeName}" in point ref "${ref}".`)

    const p = shape.points[pointName]
    if (!p) {
      const keys = Object.keys(shape.points).join(", ")
      throw new Error(
        `Unknown point "${pointName}" on shape "${shapeName}". Known: ${keys}`,
      )
    }

    return p
  }

  private resolveShape(name: string): Shape {
    const shape = this.shapes.get(name)
    if (!shape) {
      throw new Error(`Unknown shape "${name}".`)
    }
    return shape
  }

  private collectPoints(): Point[] {
    const pts: Point[] = []
    const seen = new Set<Point>()

    for (const shape of this.shapes.values()) {
      for (const p of Object.values(shape.points)) {
        if (!seen.has(p)) {
          seen.add(p)
          pts.push(p)
        }
      }
    }
    return pts
  }

  private collectConstraints(): Constraint[] {
    const all: Constraint[] = []

    for (const shape of this.shapes.values()) {
      all.push(...shape.internalConstraints())
    }

    all.push(...this.userConstraints)
    return all
  }

  async solve(options: SolveOptions = {}): Promise<void> {
    const points = this.collectPoints()

    // Assign variable indices and initial guess.
    const vars = new Float64Array(points.length * 2)
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      p.__varIndex = i * 2
      vars[i * 2] = p.x
      vars[i * 2 + 1] = p.y
    }

    const ctx: BuildContext = {
      resolvePoint: (ref: string) => this.resolvePoint(ref),
      resolveShape: (name: string) => this.resolveShape(name),
    }

    const residuals: Residual[] = []
    for (const c of this.collectConstraints()) {
      residuals.push(...c.buildResiduals(ctx))
    }

    // Gauge fixing (so examples without anchors still converge to a canonical pose).
    // Fix first point to its initial (x,y), and fix second point's y to its initial y.
    if (points.length >= 1) {
      const p0 = points[0]
      const i0 = p0.__varIndex!
      const x0 = vars[i0]
      const y0 = vars[i0 + 1]
      residuals.push((v) => v[i0] - x0)
      residuals.push((v) => v[i0 + 1] - y0)
    }
    if (points.length >= 2) {
      const p1 = points[1]
      const i1 = p1.__varIndex!
      const y1 = vars[i1 + 1]
      residuals.push((v) => v[i1 + 1] - y1)
    }

    solveLM(vars, residuals, options)

    // Write back.
    for (const p of points) {
      const i = p.__varIndex!
      p.x = vars[i]
      p.y = vars[i + 1]
    }
  }

  svg(opts?: { margin?: number; strokeWidth?: number }): string {
    const points = this.collectPoints()
    const ctx: BuildContext = {
      resolvePoint: (ref: string) => this.resolvePoint(ref),
      resolveShape: (name: string) => this.resolveShape(name),
    }

    return createSvgFromSketch({
      points,
      shapes: this.shapes.values(),
      constraints: this.collectConstraints(),
      buildContext: ctx,
      margin: opts?.margin,
      strokeWidth: opts?.strokeWidth,
    })
  }

  graphicsObject() {
    return createGraphicsObjectFromSketch({
      shapes: this.shapes.values(),
    })
  }
}
