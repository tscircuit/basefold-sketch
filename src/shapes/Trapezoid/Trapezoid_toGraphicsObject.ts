import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type TrapezoidPoints = Record<string, Point>

export function Trapezoid_toGraphicsObject(
  points: TrapezoidPoints,
): GraphicsObject {
  const longBaseStart = points.longBaseStart
  const longBaseEnd = points.longBaseEnd
  const shortBaseEnd = points.shortBaseEnd
  const shortBaseStart = points.shortBaseStart

  return {
    polygons: [
      {
        points: [longBaseStart, longBaseEnd, shortBaseEnd, shortBaseStart],
      },
    ],
  }
}
