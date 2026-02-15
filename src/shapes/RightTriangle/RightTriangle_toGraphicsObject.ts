import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type RightTrianglePoints = Record<string, Point>

export function RightTriangle_toGraphicsObject(
  shapeName: string,
  points: RightTrianglePoints,
): GraphicsObject {
  const pointAB = points.pointAB
  const pointAC = points.pointAC
  const pointBC = points.pointBC

  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    polygons: [
      {
        points: [pointAB, pointAC, pointBC],
        label: shapeName,
      },
    ],
  }
}
