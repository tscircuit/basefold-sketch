import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../core"

export function toLabeledGraphicsPoints(
  shapeName: string,
  points: Record<string, Point>,
): GraphicsObject["points"] {
  const seen = new Set<Point>()
  const labeledPoints: NonNullable<GraphicsObject["points"]> = []

  for (const [pointName, point] of Object.entries(points)) {
    if (seen.has(point)) {
      continue
    }

    seen.add(point)
    labeledPoints.push({
      x: point.x,
      y: point.y,
      label: `${shapeName}.${pointName}`,
    })
  }

  return labeledPoints
}
