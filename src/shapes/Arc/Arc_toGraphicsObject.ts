import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"
import { Arc_samplePoints } from "./Arc_toSvg"

type ArcPoints = Record<string, Point>

export function Arc_toGraphicsObject(
  shapeName: string,
  points: ArcPoints,
  clockwise: boolean,
): GraphicsObject {
  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    lines: [
      {
        points: Arc_samplePoints(points, clockwise, 32),
        label: shapeName,
      },
    ],
  }
}
