import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type RightTrianglePoints = Record<string, Point>

export function RightTriangle_toGraphicsObject(
  points: RightTrianglePoints,
): GraphicsObject {
  const pointAB = points.pointAB
  const pointAC = points.pointAC
  const pointBC = points.pointBC

  return {
    polygons: [
      {
        points: [pointAB, pointAC, pointBC],
      },
    ],
  }
}
