import type { Point, SvgTransform } from "../../core"

type InfiniteLinePoints = Record<string, Point>

const lineExtent = 10_000

export function InfiniteLine_toSvg(
  points: InfiniteLinePoints,
  t: SvgTransform,
): string {
  const start = points.start
  const end = points.end
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)

  if (length === 0) {
    const x = t.x(start.x)
    const y = t.y(start.y)
    return `<circle cx="${x}" cy="${y}" r="1" />`
  }

  const ux = dx / length
  const uy = dy / length
  const x1 = t.x(start.x - ux * lineExtent)
  const y1 = t.y(start.y - uy * lineExtent)
  const x2 = t.x(start.x + ux * lineExtent)
  const y2 = t.y(start.y + uy * lineExtent)

  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`
}
