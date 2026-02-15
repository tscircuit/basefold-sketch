import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type TrapezoidPoints = Record<string, Point>

export function Trapezoid_toGraphicsObject(
  shapeName: string,
  points: TrapezoidPoints,
): GraphicsObject {
  const longBaseStart = points.longBaseStart
  const longBaseEnd = points.longBaseEnd
  const shortBaseEnd = points.shortBaseEnd
  const shortBaseStart = points.shortBaseStart

  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    polygons: [
      {
        points: [longBaseStart, longBaseEnd, shortBaseEnd, shortBaseStart],
        label: shapeName,
      },
    ],
  }
}
