import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"
import { toLabeledGraphicsPoints } from "../toLabeledGraphicsPoints"

type InfiniteLinePoints = Record<string, Point>

export function InfiniteLine_toGraphicsObject(
  shapeName: string,
  points: InfiniteLinePoints,
): GraphicsObject {
  return {
    points: toLabeledGraphicsPoints(shapeName, points),
    lines: [{ points: [points.start, points.end], label: shapeName }],
  }
}
