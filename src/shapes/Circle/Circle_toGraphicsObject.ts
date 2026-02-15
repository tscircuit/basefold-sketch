import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type CirclePoints = Record<string, Point>

export function Circle_toGraphicsObject(
  shapeName: string,
  points: CirclePoints,
): GraphicsObject {
  const center = points.center
  const radiusPoint = points.radius
  const dx = radiusPoint.x - center.x
  const dy = radiusPoint.y - center.y
  const radius = Math.sqrt(dx * dx + dy * dy)

  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    circles: [
      { center: { x: center.x, y: center.y }, radius, label: shapeName },
    ],
  }
}
