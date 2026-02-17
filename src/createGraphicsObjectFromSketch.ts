import type { GraphicsObject } from "graphics-debug"
import type { Constraint, ConstraintGraphicsContext, Shape } from "./core"

export interface CreateGraphicsObjectFromSketchOptions {
  shapes: Iterable<Shape>
  constraints?: Iterable<Constraint>
  buildContext?: ConstraintGraphicsContext
}

function mergeGraphics(target: GraphicsObject, source: GraphicsObject): void {
  if (source.points)
    target.points = [...(target.points ?? []), ...source.points]
  if (source.lines) target.lines = [...(target.lines ?? []), ...source.lines]
  if (source.infiniteLines)
    target.infiniteLines = [
      ...(target.infiniteLines ?? []),
      ...source.infiniteLines,
    ]
  if (source.rects) target.rects = [...(target.rects ?? []), ...source.rects]
  if (source.circles)
    target.circles = [...(target.circles ?? []), ...source.circles]
  if (source.polygons)
    target.polygons = [...(target.polygons ?? []), ...source.polygons]
  if (source.arrows)
    target.arrows = [...(target.arrows ?? []), ...source.arrows]
  if (source.texts) target.texts = [...(target.texts ?? []), ...source.texts]

  if (source.coordinateSystem && !target.coordinateSystem) {
    target.coordinateSystem = source.coordinateSystem
  }

  if (source.title && !target.title) {
    target.title = source.title
  }
}

export function createGraphicsObjectFromSketch(
  options: CreateGraphicsObjectFromSketchOptions,
): GraphicsObject {
  const combined: GraphicsObject = {}

  for (const shape of options.shapes) {
    mergeGraphics(combined, shape.toGraphicsObject())
  }

  if (options.constraints && options.buildContext) {
    for (const constraint of options.constraints) {
      if (constraint.toGraphicsObject) {
        mergeGraphics(
          combined,
          constraint.toGraphicsObject(options.buildContext),
        )
      }
    }
  }

  return combined
}
