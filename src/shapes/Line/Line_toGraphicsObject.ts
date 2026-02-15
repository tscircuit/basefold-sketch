import type { GraphicsObject } from "graphics-debug"
import type { Point } from "../../core"

type LinePoints = Record<string, Point>

export function Line_toGraphicsObject(points: LinePoints): GraphicsObject {
  const start = points.start
  const end = points.end

  return {
    lines: [{ points: [start, end] }],
  }
}
