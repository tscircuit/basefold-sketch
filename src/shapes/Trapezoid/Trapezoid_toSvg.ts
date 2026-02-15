import type { Point, SvgTransform } from "../../core"

type TrapezoidPoints = Record<string, Point>

export function Trapezoid_toSvg(
  points: TrapezoidPoints,
  t: SvgTransform,
): string {
  const longBaseStart = points.longBaseStart
  const longBaseEnd = points.longBaseEnd
  const shortBaseEnd = points.shortBaseEnd
  const shortBaseStart = points.shortBaseStart

  const pts = [
    `${t.x(longBaseStart.x)},${t.y(longBaseStart.y)}`,
    `${t.x(longBaseEnd.x)},${t.y(longBaseEnd.y)}`,
    `${t.x(shortBaseEnd.x)},${t.y(shortBaseEnd.y)}`,
    `${t.x(shortBaseStart.x)},${t.y(shortBaseStart.y)}`,
  ].join(" ")

  return `<polygon points="${pts}" />`
}
