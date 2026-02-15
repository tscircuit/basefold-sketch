import type { Point, SvgTransform } from "../../core"

type OvalPoints = Record<string, Point>

function getRadii(points: OvalPoints): { rx: number; ry: number } {
  const center = points.center
  const radiusXPoint = points.radiusX
  const radiusYPoint = points.radiusY

  const dx = radiusXPoint.x - center.x
  const dy = radiusXPoint.y - center.y
  const rx = Math.sqrt(dx * dx + dy * dy)

  const ex = radiusYPoint.x - center.x
  const ey = radiusYPoint.y - center.y
  const ry = Math.sqrt(ex * ex + ey * ey)

  return { rx, ry }
}

export function Oval_toSvg(points: OvalPoints, t: SvgTransform): string {
  const center = points.center
  const { rx, ry } = getRadii(points)

  return `<ellipse cx="${t.x(center.x)}" cy="${t.y(center.y)}" rx="${rx}" ry="${ry}" />`
}

export function Oval_getBounds(points: OvalPoints): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  const center = points.center
  const { rx, ry } = getRadii(points)

  return {
    minX: center.x - rx,
    minY: center.y - ry,
    maxX: center.x + rx,
    maxY: center.y + ry,
  }
}
