import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type CirclePoints = Record<string, Point>

export function Circle_toGraphicsObject(points: CirclePoints): GraphicsObject {
  const center = points.center
  const radiusPoint = points.radius
  const dx = radiusPoint.x - center.x
  const dy = radiusPoint.y - center.y
  const radius = Math.sqrt(dx * dx + dy * dy)

  return {
    circles: [{ center: { x: center.x, y: center.y }, radius }],
  }
}
