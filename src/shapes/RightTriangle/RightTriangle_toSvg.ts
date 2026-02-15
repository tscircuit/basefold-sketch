import type { Point, SvgTransform } from "../../core"

type RightTrianglePoints = Record<string, Point>

export function RightTriangle_toSvg(
  points: RightTrianglePoints,
  t: SvgTransform,
): string {
  const pointAB = points.pointAB
  const pointAC = points.pointAC
  const pointBC = points.pointBC

  const pts = [
    `${t.x(pointAB.x)},${t.y(pointAB.y)}`,
    `${t.x(pointAC.x)},${t.y(pointAC.y)}`,
    `${t.x(pointBC.x)},${t.y(pointBC.y)}`,
  ].join(" ")

  return `<polygon points="${pts}" />`
}
