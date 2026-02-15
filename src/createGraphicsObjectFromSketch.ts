import type { GraphicsObject } from "graphics-debug"
import type { Shape } from "./core"

export interface CreateGraphicsObjectFromSketchOptions {
  shapes: Iterable<Shape>
}

export function createGraphicsObjectFromSketch(
  options: CreateGraphicsObjectFromSketchOptions,
): GraphicsObject {
  const combined: GraphicsObject = {}

  for (const shape of options.shapes) {
    const graphic = shape.toGraphicsObject()

    if (graphic.points) {
      combined.points = [...(combined.points ?? []), ...graphic.points]
    }

    if (graphic.lines) {
      combined.lines = [...(combined.lines ?? []), ...graphic.lines]
    }

    if (graphic.circles) {
      combined.circles = [...(combined.circles ?? []), ...graphic.circles]
    }

    if (graphic.polygons) {
      combined.polygons = [...(combined.polygons ?? []), ...graphic.polygons]
    }
  }

  return combined
}
