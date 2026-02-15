import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type LinePoints = Record<string, Point>

export function Line_toGraphicsObject(
  shapeName: string,
  points: LinePoints,
): GraphicsObject {
  const start = points.start
  const end = points.end

  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    lines: [{ points: [start, end], label: shapeName }],
  }
}
