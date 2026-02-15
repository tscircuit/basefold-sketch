import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type OvalPoints = Record<string, Point>

export function Oval_toGraphicsObject(points: OvalPoints): GraphicsObject {
  const center = points.center
  const radiusXPoint = points.radiusX
  const radiusYPoint = points.radiusY

  const dx = radiusXPoint.x - center.x
  const dy = radiusXPoint.y - center.y
  const rx = Math.sqrt(dx * dx + dy * dy)

  const ex = radiusYPoint.x - center.x
  const ey = radiusYPoint.y - center.y
  const ry = Math.sqrt(ex * ex + ey * ey)

  const segments = 32
  const polygonPoints = Array.from({ length: segments }, (_, index) => {
    const theta = (index / segments) * Math.PI * 2
    return {
      x: center.x + Math.cos(theta) * rx,
      y: center.y + Math.sin(theta) * ry,
    }
  })

  return {
    polygons: [{ points: polygonPoints }],
  }
}
