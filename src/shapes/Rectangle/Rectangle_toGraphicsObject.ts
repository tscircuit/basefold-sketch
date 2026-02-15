import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type RectanglePoints = Record<string, Point>

export function Rectangle_toGraphicsObject(
  shapeName: string,
  points: RectanglePoints,
): GraphicsObject {
  const topLeft = points.topLeft
  const topRight = points.topRight
  const bottomRight = points.bottomRight
  const bottomLeft = points.bottomLeft

  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    polygons: [
      {
        points: [topLeft, topRight, bottomRight, bottomLeft],
        label: shapeName,
      },
    ],
  }
}
