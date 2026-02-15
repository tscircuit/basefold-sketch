import type { Point, SvgTransform } from "../../core"

type CirclePoints = Record<string, Point>

function getRadius(points: CirclePoints): number {
  const center = points.center
  const radiusPoint = points.radius
  const dx = radiusPoint.x - center.x
  const dy = radiusPoint.y - center.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function Circle_toSvg(points: CirclePoints, t: SvgTransform): string {
  const center = points.center
  const radius = getRadius(points)

  return `<circle cx="${t.x(center.x)}" cy="${t.y(center.y)}" r="${radius}" />`
}

export function Circle_getBounds(points: CirclePoints): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  const center = points.center
  const radius = getRadius(points)

  return {
    minX: center.x - radius,
    minY: center.y - radius,
    maxX: center.x + radius,
    maxY: center.y + radius,
  }
}
