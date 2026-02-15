import type { Point, SvgTransform } from "../../core"

type RectanglePoints = Record<string, Point>

export function Rectangle_toSvg(
  points: RectanglePoints,
  t: SvgTransform,
): string {
  const tl = points.topLeft
  const tr = points.topRight
  const br = points.bottomRight
  const bl = points.bottomLeft

  const pts = [
    `${t.x(tl.x)},${t.y(tl.y)}`,
    `${t.x(tr.x)},${t.y(tr.y)}`,
    `${t.x(br.x)},${t.y(br.y)}`,
    `${t.x(bl.x)},${t.y(bl.y)}`,
  ].join(" ")

  return `<polygon points="${pts}" />`
}
