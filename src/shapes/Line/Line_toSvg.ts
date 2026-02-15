import type { Point, SvgTransform } from "../../core"

type LinePoints = Record<string, Point>

export function Line_toSvg(points: LinePoints, t: SvgTransform): string {
  const start = points.start
  const end = points.end

  return `<line x1="${t.x(start.x)}" y1="${t.y(start.y)}" x2="${t.x(end.x)}" y2="${t.y(end.y)}" />`
}
