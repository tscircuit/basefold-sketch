import type { GraphicsObject } from "graphics-debug"
import type {
  Constraint,
  EdgeReferenceDefinition,
  Point,
  Shape,
  SvgTransform,
} from "../../core"
import { Point as SketchPoint } from "../../core"
import { defineShapeEdges } from "../../edge-refs"
import { definePointRefs } from "../../point-refs"
import { FixedPointCoordinates } from "../constraints/FixedPointCoordinates"
import { InfiniteLine_toGraphicsObject } from "./InfiniteLine_toGraphicsObject"
import { InfiniteLine_toSvg } from "./InfiniteLine_toSvg"

type CardinalDirection = "x+" | "x-" | "y+" | "y-"

export type InfiniteLineDirection =
  | CardinalDirection
  | {
      x: number
      y: number
    }

export interface InfiniteLineOptions {
  name?: string
  origin?: {
    x: number
    y: number
  }
  direction: InfiniteLineDirection
}

type InfiniteLinePointName = "start" | "end"
type InfiniteLineEdgeName = "segment"
type InfiniteLineRefName = InfiniteLinePointName | InfiniteLineEdgeName

function directionToVector(direction: InfiniteLineDirection): {
  x: number
  y: number
} {
  if (direction === "x+") return { x: 1, y: 0 }
  if (direction === "x-") return { x: -1, y: 0 }
  if (direction === "y+") return { x: 0, y: 1 }
  if (direction === "y-") return { x: 0, y: -1 }

  if (!Number.isFinite(direction.x) || !Number.isFinite(direction.y)) {
    throw new Error(
      "InfiniteLine direction vector values must be finite numbers.",
    )
  }

  if (direction.x === 0 && direction.y === 0) {
    throw new Error("InfiniteLine direction vector must not be zero.")
  }

  return { x: direction.x, y: direction.y }
}

export class InfiniteLine implements Shape {
  private static nextAutoNameId = 1

  name: string
  readonly points: Record<InfiniteLinePointName, Point>
  readonly refs: Record<InfiniteLineRefName, string>
  readonly edges: Record<InfiniteLineEdgeName, EdgeReferenceDefinition> =
    defineShapeEdges({
      segment: {
        point1: "start",
        point2: "end",
      },
    })
  private _internal: Constraint[]

  constructor(opts: InfiniteLineOptions) {
    if (opts.name !== undefined && !opts.name) {
      throw new Error("InfiniteLine requires a non-empty name.")
    }

    this.name = opts.name ?? `InfiniteLine${InfiniteLine.nextAutoNameId++}`

    const origin = opts.origin ?? { x: 0, y: 0 }
    if (!Number.isFinite(origin.x) || !Number.isFinite(origin.y)) {
      throw new Error("InfiniteLine origin coordinates must be finite numbers.")
    }

    const direction = directionToVector(opts.direction)
    const start = new SketchPoint(origin.x, origin.y)
    const end = new SketchPoint(origin.x + direction.x, origin.y + direction.y)

    this.points = { start, end }
    this.refs = definePointRefs(this.name, this.points, this.edges)
    this._internal = [
      new FixedPointCoordinates(start, origin.x, origin.y),
      new FixedPointCoordinates(end, end.x, end.y),
    ]
  }

  internalConstraints(): Constraint[] {
    return this._internal
  }

  toSvg(t: SvgTransform): string {
    return InfiniteLine_toSvg(this.points, t)
  }

  toGraphicsObject(): GraphicsObject {
    return InfiniteLine_toGraphicsObject(this.name, this.points)
  }
}
