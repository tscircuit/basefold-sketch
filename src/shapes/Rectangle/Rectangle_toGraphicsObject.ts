import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type RectanglePoints = Record<string, Point>

export function Rectangle_toGraphicsObject(
  points: RectanglePoints,
): GraphicsObject {
  const topLeft = points.topLeft
  const topRight = points.topRight
  const bottomRight = points.bottomRight
  const bottomLeft = points.bottomLeft

  return {
    polygons: [
      {
        points: [topLeft, topRight, bottomRight, bottomLeft],
      },
    ],
  }
}
